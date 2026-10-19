import { useMemo } from 'react';
import { buildLeaderboard, findUserRank } from '@/core/leaderboard';
import { SEED_LEADERBOARD } from '@/data/leaderboard';
import { useAppStore } from './useAppStore';

/** Leaderboard with the current user placed by weekly XP, plus their rank. */
export function useLeaderboard() {
  const user = useAppStore((s) => s.user);
  const currentTrackId = useAppStore((s) => s.currentTrackId);

  return useMemo(() => {
    const leaderboardUsers = buildLeaderboard(user, SEED_LEADERBOARD, currentTrackId);
    return { leaderboardUsers, userRank: findUserRank(leaderboardUsers) };
  }, [user, currentTrackId]);
}
