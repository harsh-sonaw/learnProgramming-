import { XP_REWARDS } from '@/config/constants';
import type { UserProfile } from '@/types';
import { normalizeUser } from './progress';

/** XP for a solve: full the first time, a fraction when replaying. */
export function xpForSolve(alreadySolved: boolean, baseXp: number): number {
  return alreadySolved ? Math.round(baseXp * XP_REWARDS.replayMultiplier) : baseXp;
}

/** Store the submitted code as the user's solution for an exercise. */
export function recordSolution(
  user: UserProfile,
  exerciseId: string,
  code: string,
  now: Date = new Date(),
): UserProfile {
  return {
    ...user,
    solvedExercises: {
      ...user.solvedExercises,
      [exerciseId]: { passedAt: now.toISOString(), code },
    },
  };
}

/** Add a badge id if the user doesn't have it yet. */
export function unlockBadge(
  user: UserProfile,
  badgeId: string,
): { user: UserProfile; unlocked: boolean } {
  if (user.unlockedBadgeIds.includes(badgeId)) return { user, unlocked: false };
  return {
    user: { ...user, unlockedBadgeIds: [...user.unlockedBadgeIds, badgeId] },
    unlocked: true,
  };
}

/** Add `id` to `list` if absent, remove it if present. */
export function toggleId(list: readonly string[] | undefined, id: string): string[] {
  const current = list ?? [];
  return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
}

/** Merge saved data over defaults and repair level/league/streak consistency. */
export function hydrateUser(
  saved: Partial<UserProfile> | null,
  defaults: UserProfile,
  today: string,
): UserProfile {
  return normalizeUser({ ...defaults, ...(saved ?? {}) }, today);
}
