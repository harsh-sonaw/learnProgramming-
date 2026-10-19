import { useEffect, useState } from 'react';

/** Reactive `window.matchMedia`. Safe during SSR/tests (returns false). */
export function useMediaQuery(query: string): boolean {
  const getMatch = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
