import type { StateCreator } from 'zustand';
import type { ForumSlice } from './slices/forumSlice';
import type { HydrationSlice } from './slices/hydrationSlice';
import type { NavigationSlice } from './slices/navigationSlice';
import type { NotificationSlice } from './slices/notificationSlice';
import type { ProgressSlice } from './slices/progressSlice';
import type { SandboxSlice } from './slices/sandboxSlice';

/** The whole client state. Each slice owns one concern (see store/slices). */
export type AppStore = NavigationSlice &
  ProgressSlice &
  ForumSlice &
  SandboxSlice &
  NotificationSlice &
  HydrationSlice;

/** Type of a slice factory; slices can read and call each other through get(). */
export type SliceCreator<T> = StateCreator<AppStore, [], [], T>;
