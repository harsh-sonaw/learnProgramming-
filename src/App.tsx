import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { NavigationTab } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TracksView } from './components/TracksView';
import { CodingWorkspace } from './components/CodingWorkspace';
import { DailyChallengeView } from './components/DailyChallengeView';
import { CodeSandboxView } from './components/CodeSandboxView';
import { LeaderboardView } from './components/LeaderboardView';
import { CommunityForumView } from './components/CommunityForumView';
import { ProfileView } from './components/ProfileView';
import { StreakModal } from './components/StreakModal';
import { NotificationModals } from './components/NotificationModals';

/** Each tab is served as its own HTML document; this maps it to its view. */
const PAGE_VIEWS: Record<NavigationTab, React.ComponentType> = {
  tracks: TracksView,
  workspace: CodingWorkspace,
  daily: DailyChallengeView,
  sandbox: CodeSandboxView,
  leaderboards: LeaderboardView,
  community: CommunityForumView,
  profile: ProfileView,
};

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
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

      <main
        id="main-content"
        tabIndex={-1}
        className={`min-h-0 flex-1 ${isWorkspace ? 'flex flex-col' : ''}`}
      >
        <Page />
      </main>

      <StreakModal />
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
