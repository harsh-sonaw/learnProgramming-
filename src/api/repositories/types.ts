import type { ForumPost, LanguageId, UserProfile } from '@/types';

/**
 * Persistence contracts used by the store. Every method is async so that a
 * local (localStorage) and a remote (HTTP) implementation are interchangeable.
 * `load` resolves to null when nothing has been saved yet.
 */
export interface UserRepository {
  load(): Promise<Partial<UserProfile> | null>;
  save(user: UserProfile): Promise<void>;
}

export interface SandboxRepository {
  load(): Promise<Partial<Record<LanguageId, string>> | null>;
  save(code: Record<LanguageId, string>): Promise<void>;
}

export interface ForumRepository {
  load(): Promise<ForumPost[] | null>;
  save(posts: ForumPost[]): Promise<void>;
}

export interface Repositories {
  user: UserRepository;
  sandbox: SandboxRepository;
  forum: ForumRepository;
}
