import type { LanguageId } from '../types';

export type SuggestionKind = 'keyword' | 'function' | 'type' | 'snippet' | 'variable' | 'table' | 'column';

export interface Suggestion {
  label: string;
  /** Text inserted. May contain `$0` marking where the cursor ends up. */
  insertText: string;
  kind: SuggestionKind;
  /** Short hint shown next to the label. */
  detail?: string;
}

/** Static completion data for one language. */
export interface LanguageCompletions {
  keywords: readonly string[];
  /** Global functions / types / constants that can start an expression. */
  globals: readonly string[];
  /** Names offered after a dot (methods and properties). */
  members: readonly string[];
  types?: readonly string[];
  snippets: readonly Suggestion[];
  /** SQL only: extra words (table and column names). */
  extraWords?: readonly Suggestion[];
}

const WORD_CHAR = /[A-Za-z0-9_$]/;

export interface WordAtCursor {
  prefix: string;
  /** Index where the prefix starts. */
  start: number;
  /** True when the character before the prefix is a dot (member access). */
  afterDot: boolean;
}

export function getWordAtCursor(text: string, cursor: number): WordAtCursor {
  let start = cursor;
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start--;
  return { prefix: text.slice(start, cursor), start, afterDot: start > 0 && text[start - 1] === '.' };
}

/** Distinct identifiers already written in the document (excluding the word being typed). */
export function collectDocumentWords(text: string, skipStart: number, skipEnd: number): string[] {
  const without = text.slice(0, skipStart) + ' ' + text.slice(skipEnd);
  const seen = new Set<string>();
  for (const match of without.matchAll(/[A-Za-z_$][A-Za-z0-9_$]{2,}/g)) seen.add(match[0]);
  return [...seen];
}

/** Is the cursor inside a string literal or a line comment? Suggestions are muted there. */
export function isInsideStringOrComment(text: string, cursor: number, language: LanguageId): boolean {
  const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
  const line = text.slice(lineStart, cursor);
  const commentMarker = language === 'python' ? '#' : language === 'sql' ? '--' : '//';

  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || (ch === '`' && language !== 'python' && language !== 'sql')) {
      quote = ch;
    } else if (line.startsWith(commentMarker, i)) {
      return true;
    }
  }
  return quote !== null;
}

const KIND_RANK: Record<SuggestionKind, number> = {
  snippet: 0,
  variable: 1,
  column: 1,
  table: 1,
  function: 2,
  type: 2,
  keyword: 3,
};

function matchScore(candidate: string, prefix: string): number | null {
  const c = candidate.toLowerCase();
  const p = prefix.toLowerCase();
  if (c === p) return null; // already fully typed
  if (candidate.startsWith(prefix)) return 0; // same case prefix
  if (c.startsWith(p)) return 1;
  if (p.length >= 2 && c.includes(p)) return 2;
  return null;
}

export interface BuildOptions {
  limit?: number;
  /** Show suggestions even with an empty prefix (e.g. Ctrl+Space). Dot access always does. */
  force?: boolean;
}

/**
 * Suggestions for the word at `cursor`. Triggers automatically from the first typed
 * character, and right after a dot. Combines language words, snippets and identifiers
 * from the document itself.
 */
export function buildSuggestions(
  text: string,
  cursor: number,
  language: LanguageId,
  data: LanguageCompletions,
  options: BuildOptions = {},
): Suggestion[] {
  const { limit = 8, force = false } = options;
  const word = getWordAtCursor(text, cursor);

  if (isInsideStringOrComment(text, cursor, language)) return [];
  if (!word.afterDot && word.prefix.length === 0 && !force) return [];
  // Don't pop up for number literals like "12".
  if (/^[0-9]/.test(word.prefix)) return [];

  const candidates: Suggestion[] = [];

  if (word.afterDot) {
    for (const name of data.members) candidates.push({ label: name, insertText: name, kind: 'function' });
  } else {
    for (const k of data.keywords) candidates.push({ label: k, insertText: k, kind: 'keyword' });
    for (const g of data.globals) candidates.push({ label: g, insertText: g, kind: 'function' });
    for (const t of data.types ?? []) candidates.push({ label: t, insertText: t, kind: 'type' });
    candidates.push(...data.snippets);
    candidates.push(...(data.extraWords ?? []));
    const known = new Set(candidates.map((c) => c.label.toLowerCase()));
    for (const w of collectDocumentWords(text, word.start, cursor)) {
      if (!known.has(w.toLowerCase())) candidates.push({ label: w, insertText: w, kind: 'variable' });
    }
  }

  const scored: { s: Suggestion; score: number }[] = [];
  const seen = new Set<string>();
  for (const s of candidates) {
    const score = word.prefix === '' ? 0 : matchScore(s.label, word.prefix);
    if (score === null) continue;
    const key = `${s.kind}:${s.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scored.push({ s, score });
  }

  scored.sort(
    (a, b) =>
      a.score - b.score ||
      KIND_RANK[a.s.kind] - KIND_RANK[b.s.kind] ||
      a.s.label.length - b.s.label.length ||
      a.s.label.localeCompare(b.s.label),
  );
  return scored.slice(0, limit).map((x) => x.s);
}

export interface AppliedSuggestion {
  text: string;
  cursor: number;
}

/**
 * Replace the typed prefix with the suggestion. Multi-line snippets are indented to match
 * the current line, and `$0` decides where the cursor lands.
 */
export function applySuggestion(
  text: string,
  cursor: number,
  suggestion: Suggestion,
  indentUnit = '  ',
): AppliedSuggestion {
  const { start } = getWordAtCursor(text, cursor);
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const indent = /^[ \t]*/.exec(text.slice(lineStart, start))?.[0] ?? '';

  const body = suggestion.insertText.replace(/\t/g, indentUnit).split('\n').join('\n' + indent);
  const marker = body.indexOf('$0');
  const inserted = marker === -1 ? body : body.replace('$0', '');
  const caretOffset = marker === -1 ? inserted.length : marker;

  return {
    text: text.slice(0, start) + inserted + text.slice(cursor),
    cursor: start + caretOffset,
  };
}
