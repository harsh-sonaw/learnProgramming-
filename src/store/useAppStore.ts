import { create } from 'zustand';
import { createForumSlice } from './slices/forumSlice';
import { createHydrationSlice } from './slices/hydrationSlice';
import { createNavigationSlice } from './slices/navigationSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createProgressSlice } from './slices/progressSlice';
import { createSandboxSlice } from './slices/sandboxSlice';
import type { AppStore } from './types';

/**
 * The single client-side store.
 * Read with a selector so a component only re-renders for what it uses:
 *   const user = useAppStore((s) => s.user);
 *   const { activeTab, setActiveTab } = useAppStore(useShallow((s) => ({ ... })));
 */
export const useAppStore = create<AppStore>()((...args) => ({
  ...createNavigationSlice(...args),
  ...createProgressSlice(...args),
  ...createForumSlice(...args),
  ...createSandboxSlice(...args),
  ...createNotificationSlice(...args),
  ...createHydrationSlice(...args),
}));
