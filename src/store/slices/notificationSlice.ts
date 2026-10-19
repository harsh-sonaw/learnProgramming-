import { BADGES } from '@/data/badges';
import type { Badge } from '@/types';
import type { SliceCreator } from '@/store/types';

export interface NotificationSlice {
  streakModalOpen: boolean;
  badgeNotification: Badge | null;
  levelUpNotification: number | null;
  setStreakModalOpen: (open: boolean) => void;
  /** Pop up the celebration for a badge id (ignored if the id is unknown). */
  showBadgeNotification: (badgeId: string) => void;
  showLevelUp: (level: number) => void;
  dismissBadgeNotification: () => void;
  dismissLevelUpNotification: () => void;
}

export const createNotificationSlice: SliceCreator<NotificationSlice> = (set) => ({
  streakModalOpen: false,
  badgeNotification: null,
  levelUpNotification: null,

  setStreakModalOpen: (streakModalOpen) => set({ streakModalOpen }),
  showBadgeNotification: (badgeId) => {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (badge) set({ badgeNotification: badge });
  },
  showLevelUp: (level) => set({ levelUpNotification: level }),
  dismissBadgeNotification: () => set({ badgeNotification: null }),
  dismissLevelUpNotification: () => set({ levelUpNotification: null }),
});
