import { ENDPOINTS } from '@/api/endpoints';
import { HttpError, http } from '@/api/httpClient';
import type { Repositories } from './types';

/** A 404 means "nothing stored yet", which is not an error for load(). */
async function loadOrNull<T>(path: string): Promise<T | null> {
  try {
    return await http.get<T>(path);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}

/**
 * HTTP persistence. Expected backend contract:
 *   GET/PUT /users/me          -> UserProfile
 *   GET/PUT /users/me/sandbox  -> Record<LanguageId, string>
 *   GET/PUT /forum/posts       -> ForumPost[]
 * Enable with VITE_ENABLE_REMOTE_API=true and VITE_API_BASE_URL.
 */
export function createRemoteRepositories(): Repositories {
  return {
    user: {
      load: () => loadOrNull(ENDPOINTS.currentUser),
      save: async (user) => void (await http.put(ENDPOINTS.currentUser, user)),
    },
    sandbox: {
      load: () => loadOrNull(ENDPOINTS.sandbox),
      save: async (code) => void (await http.put(ENDPOINTS.sandbox, code)),
    },
    forum: {
      load: () => loadOrNull(ENDPOINTS.forumPosts),
      save: async (posts) => void (await http.put(ENDPOINTS.forumPosts, posts)),
    },
  };
}
