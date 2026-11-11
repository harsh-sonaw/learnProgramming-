import { findAnyExercise } from '../data/courses';
import { LanguageId } from '../types';

/** Every top-level destination in the app is its own HTML document. */
export type NavigationTab =
  | 'tracks'
  | 'workspace'
  | 'daily'
  | 'sandbox'
  | 'leaderboards'
  | 'community'
  | 'profile';

/** Maps a tab to the page that renders it. Clean URLs — Cloudflare Pages
 *  serves `/workspace` for `workspace.html` and redirects the `.html` form. */
export const TAB_PAGES: Record<NavigationTab, string> = {
  tracks: '/',
  workspace: '/workspace',
  daily: '/daily-challenge',
  sandbox: '/playground',
  leaderboards: '/leaderboard',
  community: '/community',
  profile: '/profile',
};

const isNavigationTab = (value: string | undefined): value is NavigationTab =>
  Boolean(value) && Object.prototype.hasOwnProperty.call(TAB_PAGES, value as string);

/**
 * Reads the tab this document renders, from `<html data-page="…">`.
 * Falls back to the tracks page so a stray/misconfigured document still renders.
 */
export const readPageTab = (): NavigationTab => {
  if (typeof document === 'undefined') return 'tracks';
  const page = document.documentElement.dataset.page;
  return isNavigationTab(page) ? page : 'tracks';
};

/** Full-page navigation. Each tab is a separate document, so this reloads the app. */
export const navigateToTab = (tab: NavigationTab, search = ''): void => {
  if (typeof window === 'undefined') return;
  window.location.href = `${TAB_PAGES[tab]}${search}`;
};

/** The exercise id carried in `?exercise=…` on the workspace page, if it exists. */
export const readExerciseFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const id = new URLSearchParams(window.location.search).get('exercise');
  return id && findAnyExercise(id) ? id : null;
};

/** URL used to open a specific exercise in the workspace page. */
export const exerciseUrl = (exerciseId: string): string =>
  `${TAB_PAGES.workspace}?exercise=${encodeURIComponent(exerciseId)}`;

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
