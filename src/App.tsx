import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'tracks' && <TracksView />}
        {activeTab === 'workspace' && <CodingWorkspace />}
        {activeTab === 'daily' && <DailyChallengeView />}
        {activeTab === 'sandbox' && <CodeSandboxView />}
        {activeTab === 'leaderboards' && <LeaderboardView />}
        {activeTab === 'community' && <CommunityForumView />}
        {activeTab === 'profile' && <ProfileView />}
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
