import { useCallback, useEffect, useRef, useState } from 'react';
import { COPY_FEEDBACK_MS } from '@/config/constants';
import { copyToClipboard } from '@/lib/clipboard';

/**
 * Copy text and expose which item was just copied.
 * `copy(text, key)` lets one component track several copy buttons.
 */
export function useCopyToClipboard(resetMs: number = COPY_FEEDBACK_MS) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string, key = 'default') => {
      const ok = await copyToClipboard(text);
      if (!ok) return false;
      setCopiedKey(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(null), resetMs);
      return true;
    },
    [resetMs],
  );

  return { copiedKey, copied: copiedKey !== null, copy };
}
