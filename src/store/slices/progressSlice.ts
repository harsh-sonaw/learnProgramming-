import { ALL_EXERCISES, COURSES } from '@/data/courses';
import { getTodayChallenge } from '@/data/challenges';
import { INITIAL_USER } from '@/data/initialUser';
import { dateKey, awardXp, purchaseStreakFreeze, type BadgeContext } from '@/core/progress';
import {
  hydrateUser,
  recordSolution,
  toggleId,
  unlockBadge,
  xpForSolve,
} from '@/core/rewards';
import { triggerConfetti } from '@/lib/confetti';
import type { UserProfile } from '@/types';
import type { SliceCreator } from '@/store/types';

const BADGE_CONTEXT: BadgeContext = {
  exerciseTrack: Object.fromEntries(ALL_EXERCISES.map((e) => [e.id, e.trackId])),
  sqlExerciseIds: (COURSES.sql?.modules.flatMap((m) => m.exercises) || []).map((e) => e.id),
};

export interface ProgressSlice {
  user: UserProfile;
  /** Award XP, advance the streak, and announce level-ups and new badges. */
  addXp: (amount: number, countsForStreak?: boolean) => void;
  completeExercise: (exerciseId: string, submittedCode: string, xpEarned: number) => void;
  solveDailyChallenge: (submittedCode: string, xpEarned: number) => void;
  /** Returns false when the user can't afford it. */
  buyStreakFreeze: (xpCost: number) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  toggleStarProject: (postId: string) => void;
  /** Unlock a badge once and show its notification. */
  grantBadge: (badgeId: string) => void;
}

export const createProgressSlice: SliceCreator<ProgressSlice> = (set, get) => ({
  user: hydrateUser(null, INITIAL_USER, dateKey()),

  addXp: (amount, countsForStreak = true) => {
    const result = awardXp(get().user, amount, dateKey(), BADGE_CONTEXT, countsForStreak);
    set({ user: result.user });
    if (result.leveledUpTo) {
      get().showLevelUp(result.leveledUpTo);
      triggerConfetti();
    }
    if (result.newBadgeIds.length > 0) get().showBadgeNotification(result.newBadgeIds[0]);
  },

  completeExercise: (exerciseId, submittedCode, xpEarned) => {
    const prev = get().user;
    const xp = xpForSolve(Boolean(prev.solvedExercises[exerciseId]), xpEarned);
    set({ user: recordSolution(prev, exerciseId, submittedCode) });
    get().addXp(xp, true);
    triggerConfetti();
  },

  solveDailyChallenge: (submittedCode, xpEarned) => {
    const today = dateKey();
    const prev = get().user;
    if (prev.dailyChallengeSolvedDate === today) return; // already rewarded today

    const solved = recordSolution(
      { ...prev, dailyChallengeSolvedDate: today },
      getTodayChallenge().id,
      submittedCode,
    );
    const { user, unlocked } = unlockBadge(solved, 'daily-hunter');
    set({ user });
    if (unlocked) get().showBadgeNotification('daily-hunter');

    get().addXp(xpEarned, true);
    triggerConfetti();
  },

  buyStreakFreeze: (xpCost) => {
    const next = purchaseStreakFreeze(get().user, xpCost);
    if (!next) return false;
    set({ user: next });
    return true;
  },

  updateUserProfile: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),

  toggleStarProject: (postId) =>
    set((s) => ({
      user: { ...s.user, starredProjectIds: toggleId(s.user.starredProjectIds, postId) },
    })),

  grantBadge: (badgeId) => {
    const { user, unlocked } = unlockBadge(get().user, badgeId);
    if (!unlocked) return;
    set({ user });
    get().showBadgeNotification(badgeId);
  },
});
