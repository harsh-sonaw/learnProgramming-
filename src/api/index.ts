import { env } from '@/config/env';
import { createLogger } from '@/lib/logger';
import { createLocalRepositories } from './repositories/local';
import { createRemoteRepositories } from './repositories/remote';
import type { Repositories } from './repositories/types';

const log = createLogger('api');

function selectRepositories(): Repositories {
  if (env.enableRemoteApi) {
    if (env.apiBaseUrl) return createRemoteRepositories();
    log.warn('VITE_ENABLE_REMOTE_API is true but VITE_API_BASE_URL is empty; using local storage.');
  }
  return createLocalRepositories();
}

/** The persistence layer the rest of the app talks to. */
export const repositories: Repositories = selectRepositories();

export { http, HttpError } from './httpClient';
export type { Repositories } from './repositories/types';
