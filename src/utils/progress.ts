import { UserProfile } from '../types';

/* ------------------------------------------------------------------ */
/* Dates (always LOCAL time, so streaks roll over at the user's        */
/* midnight, not at UTC midnight)                                      */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0); // noon avoids DST edge cases
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86400000);
}

/** Monday of the week containing the given date key. */
export function weekStartKey(key: string): string {
  const d = parseKey(key);
  const dow = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - dow);
  return dateKey(d);
}

/* ------------------------------------------------------------------ */
/* Levels & leagues                                                    */
/* ------------------------------------------------------------------ */

export const LEVEL_THRESHOLDS = [0, 200, 450, 750, 1150, 1650, 2250, 3000, 4000, 5500];

export function calculateLevel(totalXp: number): { level: number; nextLevelXp: number } {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      return { level, nextLevelXp: LEVEL_THRESHOLDS[i] };
    }
  }
  return { level, nextLevelXp: LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1500 };
}

export function leagueForXp(totalXp: number): UserProfile['league'] {
  if (totalXp >= 1200) return 'Diamond';
  if (totalXp >= 900) return 'Platinum';
  if (totalXp >= 600) return 'Gold';
  if (totalXp >= 300) return 'Silver';
  return 'Bronze';
}

/* ------------------------------------------------------------------ */
/* Streaks                                                             */
/* ------------------------------------------------------------------ */

export interface StreakState {
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakFreezes: number;
}

export interface StreakResult extends StreakState {
  freezesUsed: number;
  broken: boolean;
}

/**
 * Called when the user does something that counts as activity today.
 *  - same day            -> nothing changes
 *  - active yesterday    -> streak + 1
 *  - missed N days       -> spend N freezes if available (streak + 1),
 *                           otherwise the streak restarts at 1
 */
export function advanceStreak(state: StreakState, today: string): StreakResult {
  const gap = daysBetween(state.lastActiveDate, today);

  if (gap <= 0) {
    return { ...state, freezesUsed: 0, broken: false };
  }

  let streak = state.streak;
  let freezes = state.streakFreezes;
  let freezesUsed = 0;
  let broken = false;

  if (gap === 1) {
    streak += 1;
  } else {
    const missed = gap - 1;
    if (streak > 0 && freezes >= missed) {
      freezes -= missed;
      freezesUsed = missed;
      streak += 1;
    } else {
      streak = 1;
      broken = state.streak > 0;
    }
  }

  return {
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
    lastActiveDate: today,
    streakFreezes: freezes,
    freezesUsed,
    broken,
  };
}

/**
 * Run when the app opens. If the user has already missed more days than
 * their freezes can cover, the streak is shown as 0 straight away instead
 * of lingering until the next activity.
 */
export function reconcileStreakOnLoad(state: StreakState, today: string): StreakState {
  const gap = daysBetween(state.lastActiveDate, today);
  if (gap <= 1 || state.streak === 0) return state;
  const missed = gap - 1;
  if (state.streakFreezes >= missed) return state;
  return { ...state, streak: 0 };
}

/* ------------------------------------------------------------------ */
/* XP, levels, weekly XP, badges                                       */
/* ------------------------------------------------------------------ */

export interface BadgeContext {
  /** exerciseId -> trackId, for polyglot detection */
  exerciseTrack: Record<string, string>;
  /** every exercise id in the SQL track, for "SQL Sorcerer" */
  sqlExerciseIds: string[];
}

export function findNewBadges(user: UserProfile, ctx: BadgeContext): string[] {
  const have = new Set(user.unlockedBadgeIds);
  const fresh: string[] = [];
  const grant = (id: string, ok: boolean) => {
    if (ok && !have.has(id)) fresh.push(id);
  };

  const solvedIds = Object.keys(user.solvedExercises);
  const totalXp = user.totalXpEarned ?? user.currentXp;
  const tracks = new Set<string>();
  for (const id of solvedIds) {
    const t = ctx.exerciseTrack[id];
    if (t) tracks.add(t);
  }

  grant('first-code', solvedIds.length >= 1);
  grant('streak-3', user.streak >= 3);
  grant('streak-7', user.streak >= 7);
  grant('polyglot', tracks.size >= 2);
  grant('xp-500', totalXp >= 500);
  grant('xp-1000', totalXp >= 1000);
  grant(
    'sql-sorcerer',
    ctx.sqlExerciseIds.length > 0 && ctx.sqlExerciseIds.every(id => user.solvedExercises[id])
  );

  return fresh;
}

export interface AwardResult {
  user: UserProfile;
  leveledUpTo: number | null;
  newBadgeIds: string[];
  streakBroken: boolean;
  freezesUsed: number;
}

/**
 * Pure: returns the next user state plus the events the UI should react to.
 * No React, no side effects, so it can be unit tested.
 */
export function awardXp(
  prev: UserProfile,
  amount: number,
  today: string,
  ctx: BadgeContext,
  countsForStreak = true
): AwardResult {
  const prevTotal = prev.totalXpEarned ?? prev.currentXp;
  const totalXpEarned = prevTotal + Math.max(0, amount);

  // Weekly XP resets every Monday
  const thisWeek = weekStartKey(today);
  const weeklyBase = prev.weekStart === thisWeek ? prev.weeklyXp ?? 0 : 0;
  const weeklyXp = weeklyBase + Math.max(0, amount);

  let streakPart: StreakResult = {
    streak: prev.streak,
    longestStreak: prev.longestStreak,
    lastActiveDate: prev.lastActiveDate,
    streakFreezes: prev.streakFreezes,
    freezesUsed: 0,
    broken: false,
  };
  if (countsForStreak) {
    streakPart = advanceStreak(streakPart, today);
  }

  const { level, nextLevelXp } = calculateLevel(totalXpEarned);

  let next: UserProfile = {
    ...prev,
    totalXpEarned,
    currentXp: totalXpEarned, // level bar & league are driven by lifetime XP
    level,
    nextLevelXp,
    league: leagueForXp(totalXpEarned),
    weeklyXp,
    weekStart: thisWeek,
    streak: streakPart.streak,
    longestStreak: streakPart.longestStreak,
    lastActiveDate: countsForStreak ? streakPart.lastActiveDate : prev.lastActiveDate,
    streakFreezes: streakPart.streakFreezes,
  };

  const newBadgeIds = findNewBadges(next, ctx);
  if (newBadgeIds.length) {
    next = { ...next, unlockedBadgeIds: [...next.unlockedBadgeIds, ...newBadgeIds] };
  }

  return {
    user: next,
    leveledUpTo: level > prev.level ? level : null,
    newBadgeIds,
    streakBroken: streakPart.broken,
    freezesUsed: streakPart.freezesUsed,
  };
}

/** XP the user can actually spend (lifetime XP minus what they've spent). */
export function spendableXp(user: UserProfile): number {
  return Math.max(0, user.currentXp - (user.spentXp ?? 0));
}

/** Pure purchase: returns null if the user can't afford it. */
export function purchaseStreakFreeze(user: UserProfile, cost: number): UserProfile | null {
  if (spendableXp(user) < cost) return null;
  return {
    ...user,
    spentXp: (user.spentXp ?? 0) + cost,
    streakFreezes: user.streakFreezes + 1,
  };
}

/** Normalise a saved/seeded profile so level, league and week are consistent. */
export function normalizeUser(user: UserProfile, today: string): UserProfile {
  const total = user.totalXpEarned ?? user.currentXp;
  const { level, nextLevelXp } = calculateLevel(total);
  const week = weekStartKey(today);
  const streakState = reconcileStreakOnLoad(
    {
      streak: user.streak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      streakFreezes: user.streakFreezes,
    },
    today
  );
  return {
    ...user,
    totalXpEarned: total,
    currentXp: total,
    spentXp: user.spentXp ?? 0,
    level,
    nextLevelXp,
    league: leagueForXp(total),
    weekStart: week,
    weeklyXp: user.weekStart === week ? user.weeklyXp ?? 0 : 0,
    streak: streakState.streak,
  };
}
