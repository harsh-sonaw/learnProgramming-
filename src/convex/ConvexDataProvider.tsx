import React, { createContext, useContext, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { UserProfile, ForumPost, LanguageId } from '../types';

type SandboxCode = Record<LanguageId, string>;

interface InitialAppData {
  profile: UserProfile;
  forumPosts: ForumPost[];
  sandboxCode: SandboxCode;
  sandboxLanguage: LanguageId;
}

interface RemoteAppData {
  profile: UserProfile | null;
  forumPosts: ForumPost[] | null;
  sandboxCode: SandboxCode | null;
  sandboxLanguage: LanguageId | null;
}

interface ConvexDataContextValue {
  enabled: boolean;
  data: RemoteAppData | undefined;
  initialize: (data: InitialAppData) => Promise<null>;
  saveProfile: (value: UserProfile) => Promise<null>;
  saveForumPosts: (value: ForumPost[]) => Promise<null>;
  saveSandboxCode: (value: SandboxCode) => Promise<null>;
  saveSandboxLanguage: (value: LanguageId) => Promise<null>;
}

const ConvexDataContext = createContext<ConvexDataContextValue | null>(null);

export const ConvexDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useQuery(api.app.load, {});
  const initializeMutation = useMutation(api.app.initialize);
  const saveProfileMutation = useMutation(api.app.saveProfile);
  const saveForumPostsMutation = useMutation(api.app.saveForumPosts);
  const saveSandboxCodeMutation = useMutation(api.app.saveSandboxCode);
  const saveSandboxLanguageMutation = useMutation(api.app.saveSandboxLanguage);

  const value = useMemo<ConvexDataContextValue>(
    () => ({
      enabled: true,
      data,
      initialize: initialData => initializeMutation(initialData),
      saveProfile: profile => saveProfileMutation({ value: profile }),
      saveForumPosts: forumPosts => saveForumPostsMutation({ value: forumPosts }),
      saveSandboxCode: sandboxCode => saveSandboxCodeMutation({ value: sandboxCode }),
      saveSandboxLanguage: sandboxLanguage => saveSandboxLanguageMutation({ value: sandboxLanguage }),
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

  return <ConvexDataContext.Provider value={value}>{children}</ConvexDataContext.Provider>;
};

export const useConvexData = (): ConvexDataContextValue | null =>
  useContext(ConvexDataContext);
