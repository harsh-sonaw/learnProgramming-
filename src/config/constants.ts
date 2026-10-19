/** Keys used in localStorage. Changing a value discards users' saved progress. */
export const STORAGE_KEYS = {
  user: 'devpulse_user_profile',
  sandboxCode: 'devpulse_sandbox_code',
  forumPosts: 'devpulse_forum_posts',
} as const;

/** XP rules that were previously magic numbers inside the context. */
export const XP_REWARDS = {
  forumPost: 25,
  forumComment: 15,
  /** Re-solving an exercise pays this fraction of its XP. */
  replayMultiplier: 0.25,
  /** XP per MCQ answered correctly, paid only for score above your previous best. */
  mcqCorrect: 5,
} as const;

export const CONFETTI_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

/** How long "Copied!" style feedback stays visible. */
export const COPY_FEEDBACK_MS = 2000;

/** Delay before state changes are written to the repositories. */
export const PERSIST_DEBOUNCE_MS = 300;
