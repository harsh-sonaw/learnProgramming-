import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';
import { CommunityForumView } from '@/features/community/CommunityForumView';
import { DailyChallengeView } from '@/features/daily/DailyChallengeView';
import { LeaderboardView } from '@/features/leaderboard/LeaderboardView';
import { NotificationModals } from '@/features/notifications/NotificationModals';
import { ProfileView } from '@/features/profile/ProfileView';
import { CodeSandboxView } from '@/features/sandbox/CodeSandboxView';
import { StreakModal } from '@/features/streak/StreakModal';
import { TracksView } from '@/features/tracks/TracksView';
import { LanguageTestView } from '@/features/test/LanguageTestView';
import { CodingWorkspace } from '@/features/workspace/CodingWorkspace';
import { useAppStore } from '@/store';
import type { NavigationTab } from '@/types';

/** One screen per navigation tab. Add a tab by adding it here and in NavigationTab. */
const VIEWS: Record<NavigationTab, React.ComponentType> = {
  tracks: TracksView,
  test: LanguageTestView,
  workspace: CodingWorkspace,
  daily: DailyChallengeView,
  sandbox: CodeSandboxView,
  leaderboards: LeaderboardView,
  community: CommunityForumView,
  profile: ProfileView,
};

const SHELL = 'min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans';

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const hydrationError = useAppStore((s) => s.hydrationError);

  if (!isHydrated) {
    return <div className={`${SHELL} items-center justify-center text-slate-400`}>Loading your progress…</div>;
  }

  const View = VIEWS[activeTab];

  return (
    <div className={`${SHELL} selection:bg-emerald-500/30 selection:text-emerald-200`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-slate-100 focus:px-4 focus:py-2 focus:text-slate-950">Skip to content</a>
      <Navbar />

      {hydrationError && (
        <div role="alert" className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-sm px-4 py-2 text-center">
          Some saved data could not be loaded, so defaults are in use.
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1">
        <ErrorBoundary resetKey={activeTab}>
          <View />
        </ErrorBoundary>
      </main>

      <StreakModal />
      <NotificationModals />
    </div>
  );
}
