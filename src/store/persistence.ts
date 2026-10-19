import { repositories } from '@/api';
import { PERSIST_DEBOUNCE_MS } from '@/config/constants';
import { dateKey } from '@/core/progress';
import { hydrateUser } from '@/core/rewards';
import { DEFAULT_SANDBOX_CODE } from '@/data/sandboxDefaults';
import { INITIAL_USER } from '@/data/initialUser';
import { getErrorMessage } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { AppStore } from './types';
import { useAppStore } from './useAppStore';

const log = createLogger('persistence');

type Part = 'user' | 'sandbox' | 'forum';

/** Debounced async saver; `flush` writes immediately (used when the page closes). */
function createSaver(part: Part, save: () => Promise<void>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;

  const run = () => {
    timer = undefined;
    if (!dirty) return;
    dirty = false;
    save().catch((error) => log.error(`Failed to save "${part}"`, error));
  };

  return {
    schedule() {
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(run, PERSIST_DEBOUNCE_MS);
    },
    flush() {
      clearTimeout(timer);
      run();
    },
  };
}

/** Load saved data into the store. Returns which parts loaded successfully. */
async function hydrate(): Promise<Record<Part, boolean>> {
  const [user, sandbox, forum] = await Promise.allSettled([
    repositories.user.load(),
    repositories.sandbox.load(),
    repositories.forum.load(),
  ]);

  const patch: Partial<AppStore> = {};
  const errors: string[] = [];

  if (user.status === 'fulfilled') {
    patch.user = hydrateUser(user.value, INITIAL_USER, dateKey());
  } else {
    log.error('Could not load user profile', user.reason);
    errors.push(`profile: ${getErrorMessage(user.reason)}`);
  }

  if (sandbox.status === 'fulfilled') {
    if (sandbox.value) patch.sandboxCode = { ...DEFAULT_SANDBOX_CODE, ...sandbox.value };
  } else {
    log.error('Could not load sandbox code', sandbox.reason);
    errors.push(`sandbox: ${getErrorMessage(sandbox.reason)}`);
  }

  if (forum.status === 'fulfilled') {
    if (forum.value) patch.forumPosts = forum.value;
  } else {
    log.error('Could not load forum posts', forum.reason);
    errors.push(`forum: ${getErrorMessage(forum.reason)}`);
  }

  useAppStore.setState({
    ...patch,
    isHydrated: true,
    hydrationError: errors.length ? errors.join('; ') : null,
  });

  return {
    user: user.status === 'fulfilled',
    sandbox: sandbox.status === 'fulfilled',
    forum: forum.status === 'fulfilled',
  };
}

/** Save changes as they happen. Parts that failed to load are never overwritten. */
function startPersisting(enabled: Record<Part, boolean>): void {
  const savers = {
    user: createSaver('user', () => repositories.user.save(useAppStore.getState().user)),
    sandbox: createSaver('sandbox', () =>
      repositories.sandbox.save(useAppStore.getState().sandboxCode),
    ),
    forum: createSaver('forum', () => repositories.forum.save(useAppStore.getState().forumPosts)),
  };

  useAppStore.subscribe((state, prev) => {
    if (enabled.user && state.user !== prev.user) savers.user.schedule();
    if (enabled.sandbox && state.sandboxCode !== prev.sandboxCode) savers.sandbox.schedule();
    if (enabled.forum && state.forumPosts !== prev.forumPosts) savers.forum.schedule();
  });

  window.addEventListener('pagehide', () => {
    Object.values(savers).forEach((saver) => saver.flush());
  });

  // Write the normalized profile once (streak reconciliation happens on load).
  if (enabled.user) savers.user.schedule();
}

let initialization: Promise<void> | null = null;

/** Load saved data, then start saving. Safe to call more than once. */
export function initializeStore(): Promise<void> {
  initialization ??= hydrate()
    .then(startPersisting)
    .catch((error) => {
      // Never leave the app stuck on the loading screen.
      log.error('Store initialization failed', error);
      useAppStore.setState({ isHydrated: true, hydrationError: getErrorMessage(error) });
    });
  return initialization;
}
