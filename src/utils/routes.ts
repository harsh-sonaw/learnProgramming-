import { findAnyExercise } from '../data/courses';
import { LanguageId } from '../types';

/**
 * Every distinct task in the app is its own HTML document. Filters (which
 * leaderboard period, which forum category) stay in-page — they are views of
 * one task, not separate tasks.
 */
export type NavigationTab =
  | 'tracks'
  | 'workspace'
  | 'daily'
  | 'sandbox'
  | 'sandboxShare'
  | 'leaderboards'
  | 'community'
  | 'communityNew'
  | 'communityPost'
  | 'profile'
  | 'profileBadges'
  | 'profileEdit'
  | 'streak';

export const TAB_PAGES: Record<NavigationTab, string> = {
  tracks: '/',
  workspace: '/workspace',
  daily: '/daily-challenge',
  sandbox: '/playground',
  sandboxShare: '/playground/share',
  leaderboards: '/leaderboard',
  community: '/community',
  communityNew: '/community/new',
  communityPost: '/community/post',
  profile: '/profile',
  profileBadges: '/profile/badges',
  profileEdit: '/profile/edit',
  streak: '/streak',
};

/** Which top-level nav item each page belongs to. */
export const PAGE_SECTION: Record<NavigationTab, string> = {
  tracks: 'Learn',
  workspace: 'Learn',
  daily: 'Compete',
  leaderboards: 'Compete',
  sandbox: 'Practice',
  sandboxShare: 'Practice',
  community: 'Community',
  communityNew: 'Community',
  communityPost: 'Community',
  profile: 'Profile',
  profileBadges: 'Profile',
  profileEdit: 'Profile',
  streak: 'Profile',
};

/** Top navigation, in display order. */
export const NAV_ITEMS = ['Learn', 'Practice', 'Compete', 'Community', 'Profile'] as const;

export const SECTION_HOME: Record<(typeof NAV_ITEMS)[number], string> = {
  Learn: '/',
  Practice: '/playground',
  Compete: '/leaderboard',
  Community: '/community',
  Profile: '/profile',
};

const isNavigationTab = (value: string | undefined): value is NavigationTab =>
  Boolean(value) && Object.prototype.hasOwnProperty.call(TAB_PAGES, value as string);

/** Reads the page this document renders, from `<html data-page="…">`. */
export const readPageTab = (): NavigationTab => {
  if (typeof document === 'undefined') return 'tracks';
  const page = document.documentElement.dataset.page;
  return isNavigationTab(page) ? page : 'tracks';
};

export const navigateToTab = (tab: NavigationTab, search = ''): void => {
  if (typeof window === 'undefined') return;
  window.location.href = `${TAB_PAGES[tab]}${search}`;
};

/** Query-string value used as a page key (exercise id, post id). */
export const readQueryParam = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key) ?? null;
};

export const withParam = (page: NavigationTab, key: string, value: string): string =>
  `${TAB_PAGES[page]}?${key}=${encodeURIComponent(value)}`;

/** The exercise id carried in `?exercise=…`, if it resolves to a real exercise. */
export const readExerciseFromUrl = (): string | null => {
  const id = readQueryParam('exercise');
  return id && findAnyExercise(id) ? id : null;
};

export const exerciseUrl = (exerciseId: string): string => withParam('workspace', 'exercise', exerciseId);

/** Keeps the address bar in sync as you move between exercises without a reload. */
export const replaceExerciseInUrl = (exerciseId: string): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('exercise', exerciseId);
  window.history.replaceState({}, '', url);
};

/** Persisted so the chosen track survives navigation between pages. */
export const TRACK_STORAGE_KEY = 'devpulse_current_track';

export const readStoredTrack = (isTrackId: (value: string) => value is LanguageId): LanguageId | null => {
  try {
    const saved = localStorage.getItem(TRACK_STORAGE_KEY);
    return saved && isTrackId(saved) ? saved : null;
  } catch {
    return null;
  }
};

export const storeTrack = (trackId: LanguageId): void => {
  try {
    localStorage.setItem(TRACK_STORAGE_KEY, trackId);
  } catch {
    // storage unavailable — selection still works for this page
  }
};
