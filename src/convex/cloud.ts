import { createContext, useContext } from 'react';
import type { UserProfile, ForumPost, LanguageId } from '../types';

/**
 * Convex-free half of the cloud-sync contract.
 *
 * AppContext imports from here (never from ConvexDataProvider) so that with no
 * VITE_CONVEX_URL the Convex client and its generated API are never loaded.
 * The provider is attached to this context only by `mountCloud`.
 */

export type SandboxCode = Record<LanguageId, string>;

export interface CloudInitialData {
  profile: UserProfile;
  forumPosts: ForumPost[];
  sandboxCode: SandboxCode;
  sandboxLanguage: LanguageId;
}

export interface CloudData {
  profile: UserProfile | null;
  forumPosts: ForumPost[] | null;
  sandboxCode: SandboxCode | null;
  sandboxLanguage: LanguageId | null;
}

export interface CloudSync {
  enabled: boolean;
  data: CloudData | undefined;
  initialize: (data: CloudInitialData) => Promise<null>;
  saveProfile: (value: UserProfile) => Promise<null>;
  saveForumPosts: (value: ForumPost[]) => Promise<null>;
  saveSandboxCode: (value: SandboxCode) => Promise<null>;
  saveSandboxLanguage: (value: LanguageId) => Promise<null>;
}

export const CloudSyncContext = createContext<CloudSync | null>(null);

export const useConvexData = (): CloudSync | null => useContext(CloudSyncContext);
