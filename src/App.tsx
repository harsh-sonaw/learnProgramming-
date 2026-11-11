import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { NavigationTab } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TracksView } from './components/TracksView';
import { CodingWorkspace } from './components/CodingWorkspace';
import { DailyChallengeView } from './components/DailyChallengeView';
import { CodeSandboxView } from './components/CodeSandboxView';
import { ShareSnippetView } from './components/ShareSnippetView';
import { LeaderboardView } from './components/LeaderboardView';
import { CommunityForumView } from './components/CommunityForumView';
import { CommunityPostView } from './components/CommunityPostView';
import { NewDiscussionView } from './components/NewDiscussionView';
import { ProfileView } from './components/ProfileView';
import { BadgesView } from './components/BadgesView';
import { EditProfileView } from './components/EditProfileView';
import { StreakView } from './components/StreakView';
import { NotificationModals } from './components/NotificationModals';

/** One document per page; this maps the page id to its view. */
const PAGE_VIEWS: Record<NavigationTab, React.ComponentType> = {
  tracks: TracksView,
  workspace: CodingWorkspace,
  daily: DailyChallengeView,
  sandbox: CodeSandboxView,
  sandboxShare: ShareSnippetView,
  leaderboards: LeaderboardView,
  community: CommunityForumView,
  communityNew: NewDiscussionView,
  communityPost: CommunityPostView,
  profile: ProfileView,
  profileBadges: BadgesView,
  profileEdit: EditProfileView,
  streak: StreakView,
};

const AppContent: React.FC = () => {
  const { activeTab, cloudSyncEnabled, syncError, retryCloudSync } = useApp();
  const Page = PAGE_VIEWS[activeTab];
  const isWorkspace = activeTab === 'workspace';

  return (
    <div
      className={`flex flex-col bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 ${
        isWorkspace ? 'min-h-screen lg:h-dvh lg:overflow-hidden' : 'min-h-screen'
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-slate-100 focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to content
      </a>
      <Navbar />

      {!cloudSyncEnabled && (
        <div
          role="status"
          className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-sm text-amber-200"
        >
          Convex is not configured in this build; your data is saved only in this browser.
        </div>
      )}

      {syncError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 border-b border-rose-500/30 bg-rose-950/60 px-4 py-2 text-sm text-rose-200"
        >
          <span>Cloud sync failed: {syncError}</span>
          <button
            type="button"
            onClick={retryCloudSync}
            className="shrink-0 rounded border border-rose-400/40 px-3 py-1 font-semibold hover:bg-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      <main
        id="main-content"
        tabIndex={-1}
        className={`min-h-0 flex-1 ${isWorkspace ? 'flex flex-col' : ''}`}
      >
        <Page />
      </main>

      <NotificationModals />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
