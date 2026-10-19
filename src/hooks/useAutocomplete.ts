import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { applySuggestion, buildSuggestions, type Suggestion } from '@/core/autocomplete';
import { getCompletions, indentUnitFor } from '@/data/completions';
import type { LanguageId } from '@/types';

interface UseAutocompleteOptions {
  value: string;
  onChange: (next: string) => void;
  language: LanguageId;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Automatic code suggestions for a plain <textarea>.
 *
 * Suggestions appear while typing (and after a dot). Tab accepts the highlighted one;
 * Arrow keys move the highlight, then Enter accepts too; Esc hides the list. Tapping a
 * suggestion works on touch screens.
 */
export function useAutocomplete({ value, onChange, language, textareaRef }: UseAutocompleteOptions) {
  const [cursor, setCursor] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [navigated, setNavigated] = useState(false);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const all = useMemo(
    () => buildSuggestions(value, cursor, language, getCompletions(language)),
    [value, cursor, language],
  );

  const stateKey = `${cursor}:${value.length}`;
  const suggestions = dismissedKey === stateKey ? [] : all;

  // New list => highlight the first item again.
  const signature = suggestions.map((s) => s.label).join('|');
  useEffect(() => {
    setSelectedIndex(0);
    setNavigated(false);
  }, [signature]);

  const syncCursor = useCallback((event: SyntheticEvent<HTMLTextAreaElement>) => {
    setCursor(event.currentTarget.selectionStart);
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
      setCursor(event.target.selectionStart);
    },
    [onChange],
  );

  const accept = useCallback(
    (suggestion: Suggestion) => {
      const position = textareaRef.current?.selectionStart ?? cursor;
      const applied = applySuggestion(value, position, suggestion, indentUnitFor(language));
      onChange(applied.text);
      setCursor(applied.cursor);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(applied.cursor, applied.cursor);
      });
    },
    [cursor, language, onChange, textareaRef, value],
  );

  /** Returns true when the key was used by the suggestion list (caller should stop). */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (suggestions.length === 0) return false;
      if (event.ctrlKey || event.metaKey || event.altKey) return false;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setNavigated(true);
          setSelectedIndex((i) => (i + 1) % suggestions.length);
          return true;
        case 'ArrowUp':
          event.preventDefault();
          setNavigated(true);
          setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
          return true;
        case 'Tab':
          event.preventDefault();
          accept(suggestions[selectedIndex] ?? suggestions[0]);
          return true;
        case 'Enter':
          // Plain Enter stays a newline unless the user picked an item with the arrows.
          if (!navigated || event.shiftKey) return false;
          event.preventDefault();
          accept(suggestions[selectedIndex] ?? suggestions[0]);
          return true;
        case 'Escape':
          event.preventDefault();
          setDismissedKey(stateKey);
          return true;
        default:
          return false;
      }
    },
    [accept, navigated, selectedIndex, stateKey, suggestions],
  );

  return {
    suggestions,
    selectedIndex,
    accept,
    handleKeyDown,
    /** Spread onto the <textarea>; add your own onKeyDown that calls handleKeyDown first. */
    textareaProps: {
      onChange: handleChange,
      onSelect: syncCursor,
      onClick: syncCursor,
      onKeyUp: syncCursor,
    },
  };
}
