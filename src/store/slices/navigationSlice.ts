import { ALL_EXERCISES } from '@/data/courses';
import type { LanguageId, NavigationTab } from '@/types';
import type { SliceCreator } from '@/store/types';

export interface NavigationSlice {
  activeTab: NavigationTab;
  currentTrackId: LanguageId;
  currentExerciseId: string;
  setActiveTab: (tab: NavigationTab) => void;
  setCurrentTrackId: (id: LanguageId) => void;
  setCurrentExerciseId: (id: string) => void;
  /** Open an exercise in the workspace (switches track and tab too). */
  selectExercise: (id: string) => void;
}

export const createNavigationSlice: SliceCreator<NavigationSlice> = (set) => ({
  activeTab: 'tracks',
  currentTrackId: 'python',
  currentExerciseId: 'py-ex-1',

  setActiveTab: (activeTab) => set({ activeTab }),
  setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
  setCurrentExerciseId: (currentExerciseId) => set({ currentExerciseId }),

  selectExercise: (id) => {
    const exercise = ALL_EXERCISES.find((e) => e.id === id);
    set(
      exercise
        ? { currentTrackId: exercise.trackId, currentExerciseId: id, activeTab: 'workspace' }
        : { currentExerciseId: id, activeTab: 'workspace' },
    );
  },
});
