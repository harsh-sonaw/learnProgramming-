import type { NavigationTab } from '@/types';

/** A screen the app can show. The workspace also carries the open exercise. */
export interface Route {
  tab: NavigationTab;
  exerciseId?: string;
}

/** URL segment for each screen. Hash-based, so it works on any static host. */
const TAB_SEGMENTS: Record<Exclude<NavigationTab, 'workspace'>, string> = {
  tracks: 'learn',
  test: 'tests',
  daily: 'daily',
  sandbox: 'playground',
  leaderboards: 'leaderboard',
  community: 'community',
  profile: 'profile',
};

export function routeToHash(route: Route): string {
  if (route.tab === 'workspace') {
    return route.exerciseId ? `#/learn/exercise/${encodeURIComponent(route.exerciseId)}` : '#/learn';
  }
  return `#/${TAB_SEGMENTS[route.tab]}`;
}

/** Parse "#/learn/exercise/py-ex-1" etc. Returns null for empty or unknown hashes. */
export function parseHash(hash: string): Route | null {
  let parts: string[];
  try {
    parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return null; // malformed percent-encoding
  }
  if (parts.length === 0) return null;

  if (parts[0] === 'learn' && parts[1] === 'exercise' && parts.length === 3) {
    return { tab: 'workspace', exerciseId: parts[2] };
  }
  if (parts.length !== 1) return null;

  const match = (Object.entries(TAB_SEGMENTS) as [Exclude<NavigationTab, 'workspace'>, string][]).find(
    ([, segment]) => segment === parts[0],
  );
  return match ? { tab: match[0] } : null;
}
