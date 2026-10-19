import { createLogger } from './logger';

const log = createLogger('storage');

/**
 * Read and parse JSON from localStorage.
 * Returns `fallback` when the key is missing, the JSON is corrupt, storage is
 * unavailable (private mode), or `validate` rejects the shape.
 */
export function readJson<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed: unknown = JSON.parse(stored);
    if (validate && !validate(parsed)) {
      log.warn(`Ignoring invalid data under "${key}"`);
      return fallback;
    }
    return parsed as T;
  } catch (error) {
    log.warn(`Could not read "${key}"`, error);
    return fallback;
  }
}

/** Serialize and store a value. Returns false (and logs) instead of throwing. */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    log.error(`Could not write "${key}" (storage full or blocked?)`, error);
    return false;
  }
}
