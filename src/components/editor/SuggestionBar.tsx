import { useEffect, useRef } from 'react';
import type { Suggestion, SuggestionKind } from '@/core/autocomplete';

const KIND_STYLE: Record<SuggestionKind, { tag: string; className: string }> = {
  keyword: { tag: 'kw', className: 'text-purple-300 bg-purple-500/15' },
  function: { tag: 'fn', className: 'text-sky-300 bg-sky-500/15' },
  type: { tag: 'ty', className: 'text-cyan-300 bg-cyan-500/15' },
  snippet: { tag: 'sn', className: 'text-amber-300 bg-amber-500/15' },
  variable: { tag: 'var', className: 'text-emerald-300 bg-emerald-500/15' },
  table: { tag: 'tbl', className: 'text-pink-300 bg-pink-500/15' },
  column: { tag: 'col', className: 'text-rose-300 bg-rose-500/15' },
};

interface SuggestionBarProps {
  suggestions: readonly Suggestion[];
  selectedIndex: number;
  onAccept: (suggestion: Suggestion) => void;
}

/**
 * Horizontal strip of suggestions above the editor. Always the same height so the
 * editor doesn't jump, and works on touch screens where there is no Tab key.
 */
export function SuggestionBar({ suggestions, selectedIndex, onAccept }: SuggestionBarProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selectedIndex, suggestions]);

  return (
    <div
      role="listbox"
      aria-label="Code suggestions"
      className="h-9 shrink-0 flex items-center gap-1.5 px-2 overflow-x-auto bg-slate-900/70 border-b border-slate-800 text-xs font-mono"
    >
      {suggestions.length === 0 ? (
        <span className="px-1 text-slate-500 whitespace-nowrap">Suggestions appear as you type · Tab to accept</span>
      ) : (
        suggestions.map((suggestion, index) => {
          const style = KIND_STYLE[suggestion.kind];
          const isSelected = index === selectedIndex;
          return (
            <button
              key={`${suggestion.kind}:${suggestion.label}`}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              // Keep focus (and the keyboard) in the editor when tapping a suggestion.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onAccept(suggestion)}
              className={`shrink-0 flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-md border transition-colors ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500/60 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span className={`px-1 rounded text-[10px] leading-4 ${style.className}`}>{style.tag}</span>
              {suggestion.label}
            </button>
          );
        })
      )}
    </div>
  );
}
