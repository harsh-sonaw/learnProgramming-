import React, { useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CloudSync, CloudSyncContext, SandboxCode } from './cloud';
import type { UserProfile, ForumPost, LanguageId } from '../types';

/**
 * Convex-backed sync. Only reachable through `mountCloud`, which is imported
 * dynamically and only when VITE_CONVEX_URL is configured.
 */
export const ConvexDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useQuery(api.app.load, {});
  const initializeMutation = useMutation(api.app.initialize);
  const saveProfileMutation = useMutation(api.app.saveProfile);
  const saveForumPostsMutation = useMutation(api.app.saveForumPosts);
  const saveSandboxCodeMutation = useMutation(api.app.saveSandboxCode);
  const saveSandboxLanguageMutation = useMutation(api.app.saveSandboxLanguage);

  const value = useMemo<CloudSync>(
    () => ({
      enabled: true,
      data,
      initialize: initialData => initializeMutation(initialData),
      saveProfile: (profile: UserProfile) => saveProfileMutation({ value: profile }),
      saveForumPosts: (forumPosts: ForumPost[]) => saveForumPostsMutation({ value: forumPosts }),
      saveSandboxCode: (sandboxCode: SandboxCode) => saveSandboxCodeMutation({ value: sandboxCode }),
      saveSandboxLanguage: (sandboxLanguage: LanguageId) =>
        saveSandboxLanguageMutation({ value: sandboxLanguage }),
    }),
    [
      data,
      initializeMutation,
      saveProfileMutation,
      saveForumPostsMutation,
      saveSandboxCodeMutation,
      saveSandboxLanguageMutation,
    ]
  );

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
};
