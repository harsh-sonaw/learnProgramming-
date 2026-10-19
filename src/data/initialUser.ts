import { dateKey } from '@/core/progress';
import type { UserProfile } from '@/types';

/** Profile used for a brand-new visitor (demo data; replace with real sign-up later). */
export const INITIAL_USER: UserProfile = {
  id: 'user-current',
  username: 'pritesh_codes',
  displayName: 'Pritesh',
  bio: 'Software Craftsman | Full-stack learner & competitive problem solver',
  avatarSeed: 'pritesh',
  avatarBg: 'bg-emerald-600',
  joinedDate: 'October 2026',
  level: 3,
  currentXp: 385,
  nextLevelXp: 600,
  streak: 5,
  longestStreak: 12,
  streakFreezes: 2,
  lastActiveDate: dateKey(),
  league: 'Gold',
  solvedExercises: {
    'py-ex-1': { passedAt: new Date(Date.now() - 86400000 * 2).toISOString(), code: 'def is_palindrome(s):\n    c = "".join(x.lower() for x in s if x.isalnum())\n    return c == c[::-1]' },
    'js-ex-1': { passedAt: new Date(Date.now() - 86400000).toISOString(), code: 'function chunkArray(array, size) {\n  const result = [];\n  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));\n  return result;\n}' }
  },
  unlockedBadgeIds: ['first-code', 'streak-3', 'community-beacon'],
  starredProjectIds: ['post-2']
};
