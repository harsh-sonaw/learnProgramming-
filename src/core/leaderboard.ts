import type { LanguageId, LeaderboardUser, UserProfile } from '@/types';

/** Place the current user among the seeded players, ranked by weekly XP. */
export function buildLeaderboard(
  user: UserProfile,
  seed: readonly LeaderboardUser[],
  topLanguage: LanguageId,
): LeaderboardUser[] {
  const me: LeaderboardUser = {
    id: user.id,
    rank: 1,
    username: user.username,
    displayName: user.displayName,
    avatarSeed: user.avatarSeed,
    avatarBg: user.avatarBg,
    weeklyXp: user.weeklyXp ?? 0,
    totalXp: user.totalXpEarned ?? user.currentXp,
    streak: user.streak,
    league: user.league,
    topLanguage,
    isCurrentUser: true,
  };

  return [...seed.filter((u) => u.id !== user.id), me]
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .map((u, index) => ({ ...u, rank: index + 1 }));
}

export function findUserRank(board: readonly LeaderboardUser[]): number {
  return board.find((u) => u.isCurrentUser)?.rank ?? 1;
}
