import type { SliceCreator } from '@/store/types';

export interface HydrationSlice {
  /** True once saved data has been loaded from the repositories. */
  isHydrated: boolean;
  /** Set when some saved data could not be loaded. The app still runs with defaults. */
  hydrationError: string | null;
}

export const createHydrationSlice: SliceCreator<HydrationSlice> = () => ({
  isHydrated: false,
  hydrationError: null,
});
