import { STORAGE_KEYS } from '@/config/constants';
import { AppError } from '@/lib/errors';
import { readJson, writeJson } from '@/lib/storage';
import type { ForumPost, LanguageId, UserProfile } from '@/types';
import type { Repositories } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Shallow shape checks: deep repair happens in core/rewards.hydrateUser.
const isUserData = (value: unknown): value is Partial<UserProfile> => isRecord(value);
const isSandboxData = (value: unknown): value is Partial<Record<LanguageId, string>> =>
  isRecord(value);
const isPostList = (value: unknown): value is ForumPost[] => Array.isArray(value);

function persist(key: string, value: unknown): Promise<void> {
  return writeJson(key, value)
    ? Promise.resolve()
    : Promise.reject(new AppError(`Could not save "${key}" to local storage`, 'STORAGE'));
}

/** Browser-only persistence. Default implementation. */
export function createLocalRepositories(): Repositories {
  return {
    user: {
      load: async () => readJson<Partial<UserProfile> | null>(STORAGE_KEYS.user, null, isUserData),
      save: (user) => persist(STORAGE_KEYS.user, user),
    },
    sandbox: {
      load: async () =>
        readJson<Partial<Record<LanguageId, string>> | null>(
          STORAGE_KEYS.sandboxCode,
          null,
          isSandboxData,
        ),
      save: (code) => persist(STORAGE_KEYS.sandboxCode, code),
    },
    forum: {
      load: async () => readJson<ForumPost[] | null>(STORAGE_KEYS.forumPosts, null, isPostList),
      save: (posts) => persist(STORAGE_KEYS.forumPosts, posts),
    },
  };
}
