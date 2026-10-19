import { parseHash, routeToHash, type Route } from '@/core/routing';
import { DAILY_CHALLENGES } from '@/data/challenges';
import { ALL_EXERCISES } from '@/data/courses';
import { useAppStore } from './useAppStore';

const findExercise = (id: string) =>
  ALL_EXERCISES.find((e) => e.id === id) ?? DAILY_CHALLENGES.find((c) => c.id === id);

function currentRoute(): Route {
  const { activeTab, currentExerciseId } = useAppStore.getState();
  return { tab: activeTab, exerciseId: activeTab === 'workspace' ? currentExerciseId : undefined };
}

/** Put the store on the screen described by `route` (unknown routes fall back to Learn). */
function applyRoute(route: Route | null): void {
  if (!route) {
    useAppStore.setState({ activeTab: 'tracks' });
    return;
  }
  if (route.tab === 'workspace') {
    const exercise = route.exerciseId ? findExercise(route.exerciseId) : undefined;
    if (!exercise) {
      useAppStore.setState({ activeTab: 'tracks' });
      return;
    }
    useAppStore.setState({
      activeTab: 'workspace',
      currentExerciseId: exercise.id,
      currentTrackId: exercise.trackId,
    });
    return;
  }
  useAppStore.setState({ activeTab: route.tab });
}

let started = false;

/**
 * Keep the browser history in step with the visible screen, so the phone's Back button
 * returns to the previous screen instead of leaving the site, refresh keeps your place,
 * and a screen can be shared as a link (e.g. #/learn/exercise/py-ex-1).
 */
export function initNavigationSync(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  let applying = false;
  const apply = (route: Route | null) => {
    applying = true;
    try {
      applyRoute(route);
    } finally {
      applying = false;
    }
  };

  // Open the screen named in the URL, then normalize the URL without adding an entry.
  apply(parseHash(window.location.hash));
  window.history.replaceState(null, '', routeToHash(currentRoute()));

  useAppStore.subscribe((state, prev) => {
    if (applying) return;
    const tabChanged = state.activeTab !== prev.activeTab;
    const exerciseChanged =
      state.activeTab === 'workspace' && state.currentExerciseId !== prev.currentExerciseId;
    if (!tabChanged && !exerciseChanged) return;

    const hash = routeToHash(currentRoute());
    if (hash !== window.location.hash) window.history.pushState(null, '', hash);
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0 });
  });

  // Back / Forward (and manual hash edits).
  window.addEventListener('popstate', () => apply(parseHash(window.location.hash)));
}
