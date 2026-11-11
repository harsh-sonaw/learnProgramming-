import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, LanguageId, ForumPost, Badge, LeaderboardUser } from '../types';
import { COURSES, ALL_EXERCISES, findAnyExercise } from '../data/courses';
import { BADGES } from '../data/badgesData';
import { SEED_FORUM_POSTS } from '../data/forumData';
import { SEED_LEADERBOARD, LEAGUE_TIERS } from '../data/leaderboardData';
import { getTodayChallenge } from '../data/challenges';
import { useConvexData } from '../convex/cloud';
import {
  dateKey,
  awardXp,
  AwardResult,
  BadgeContext,
  normalizeUser,
  purchaseStreakFreeze,
} from '../utils/progress';
import {
  NavigationTab,
  navigateToTab,
  readPageTab,
  readExerciseFromUrl,
  replaceExerciseInUrl,
  readStoredTrack,
  storeTrack,
} from '../utils/routes';

const BADGE_CONTEXT: BadgeContext = {
  exerciseTrack: Object.fromEntries(ALL_EXERCISES.map(e => [e.id, e.trackId])),
  sqlExerciseIds: (COURSES.sql?.modules.flatMap(m => m.exercises) || []).map(e => e.id),
};

// Every tab is rendered by its own HTML document, so this type now lives with
// the page routes. Re-exported here so existing imports keep working.
export type { NavigationTab };

const isLanguageId = (value: string): value is LanguageId =>
  Object.prototype.hasOwnProperty.call(COURSES, value);

interface AppContextType {
  user: UserProfile;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentTrackId: LanguageId;
  setCurrentTrackId: (id: LanguageId) => void;
  currentExerciseId: string;
  setCurrentExerciseId: (id: string) => void;
  selectExercise: (id: string) => void;
  completeExercise: (exerciseId: string, submittedCode: string, xpEarned: number) => void;
  solveDailyChallenge: (submittedCode: string, xpEarned: number) => void;
  sandboxCode: Record<LanguageId, string>;
  setSandboxCode: (lang: LanguageId, code: string) => void;
  sandboxLanguage: LanguageId;
  setSandboxLanguage: (lang: LanguageId) => void;
  forkCodeToSandbox: (code: string, language: LanguageId) => void;
  forumPosts: ForumPost[];
  createForumPost: (post: Omit<ForumPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorAvatarBg' | 'createdAt' | 'upvotes' | 'commentsCount' | 'comments'>) => void;
  upvoteForumPost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => void;
  markAnswerAccepted: (postId: string, commentId: string) => void;
  toggleStarProject: (postId: string) => void;
  useStreakFreeze: () => boolean;
  buyStreakFreeze: (xpCost: number) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  badgeNotification: Badge | null;
  dismissBadgeNotification: () => void;
  levelUpNotification: number | null;
  dismissLevelUpNotification: () => void;
  leaderboardUsers: LeaderboardUser[];
  userRank: number;
  cloudSyncEnabled: boolean;
  syncError: string | null;
  retryCloudSync: () => void;
  triggerConfetti: () => void;
}

const DEFAULT_SANDBOX_CODE: Record<LanguageId, string> = {
  python: `# DevPulse Python Interactive Sandbox
# Write any Python code and hit "Run Code"

def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Generated Fibonacci Series:")
print(fibonacci(10))
`,
  javascript: `// DevPulse Modern JavaScript Playground
// Run modern JS with full console output

const developers = [
  { name: 'Alice', language: 'TypeScript', solved: 42 },
  { name: 'Bob', language: 'Python', solved: 35 },
  { name: 'Charlie', language: 'Go', solved: 28 },
];

const totalSolved = developers.reduce((acc, dev) => acc + dev.solved, 0);
console.log('Total problems solved by team:', totalSolved);

const topPerformer = developers.sort((a, b) => b.solved - a.solved)[0];
console.log('Top coder:', topPerformer.name, 'with', topPerformer.solved, 'exercises');
`,
  typescript: `// DevPulse TypeScript Playground
interface DeveloperMetric {
  id: string;
  name: string;
  languages: string[];
  streakDays: number;
}

const coder: DeveloperMetric = {
  id: 'dev-001',
  name: 'Alex Rivera',
  languages: ['TypeScript', 'Python', 'SQL'],
  streakDays: 14
};

console.log('Developer profile:', coder.name);
console.log('Current streak:', coder.streakDays, 'days unbroken!');
`,
  go: `// DevPulse Go Playground (Simulation)
package main

func main() {
    languages := []string{"Go", "Rust", "Python", "TypeScript"}
    fmt.Println("Languages active in DevPulse:")
    for i, lang := range languages {
        fmt.Println(i+1, "->", lang)
    }
}
`,
  sql: `-- DevPulse Interactive Relational SQL
-- Query the in-memory database: employees, departments, products, orders

SELECT 
  department, 
  COUNT(id) AS head_count, 
  AVG(salary) AS average_salary
FROM employees
GROUP BY department
ORDER BY average_salary DESC;
`
};

const INITIAL_USER: UserProfile = {
  id: 'user-current',
  username: 'pritesh_codes',
  displayName: 'Pritesh',
  bio: 'Software Craftsman | Full-stack learner & competitive problem solver',
  avatarSeed: 'pritesh',
  avatarBg: 'bg-emerald-600',
  joinedDate: 'October 2026',
  level: 3,
  currentXp: 385,
  nextLevelXp: 600,
  streak: 5,
  longestStreak: 12,
  streakFreezes: 2,
  lastActiveDate: dateKey(),
  league: 'Gold',
  solvedExercises: {
    'py-ex-1': { passedAt: new Date(Date.now() - 86400000 * 2).toISOString(), code: 'def is_palindrome(s):\n    c = "".join(x.lower() for x in s if x.isalnum())\n    return c == c[::-1]' },
    'js-ex-1': { passedAt: new Date(Date.now() - 86400000).toISOString(), code: 'function chunkArray(array, size) {\n  const result = [];\n  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));\n  return result;\n}' }
  },
  unlockedBadgeIds: ['first-code', 'streak-3', 'community-beacon'],
  starredProjectIds: ['post-2']
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const convexData = useConvexData();
  // Load initial state with localStorage support
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('devpulse_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist and level/league/streak are consistent
        return normalizeUser({ ...INITIAL_USER, ...parsed }, dateKey());
      }
    } catch {
      // Fallback
    }
    return normalizeUser(INITIAL_USER, dateKey());
  });

  // Always read/write the latest user through a ref so several updates in one
  // tick never overwrite each other, and side effects (confetti, badge popups)
  // stay out of React state updaters.
  const userRef = useRef(user);
  const commitUser = (next: UserProfile) => {
    userRef.current = next;
    setUser(next);
  };
  const cloudReadyRef = useRef(false);
  const initializationStartedRef = useRef(false);
  const cloudSnapshotRef = useRef<{
    profile: string;
    forumPosts: string;
    sandboxCode: string;
    sandboxLanguage: string;
  } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncRetry, setSyncRetry] = useState(0);

  // Each tab is a separate HTML document, so the active tab is a property of
  // the page itself rather than React state.
  const activeTab = readPageTab();

  const exerciseFromUrl = readExerciseFromUrl();
  const [currentExerciseId, setCurrentExerciseIdState] = useState<string>(
    () => exerciseFromUrl ?? 'py-ex-1'
  );
  const [currentTrackId, setCurrentTrackIdState] = useState<LanguageId>(() => {
    if (exerciseFromUrl) {
      const exercise = findAnyExercise(exerciseFromUrl);
      if (exercise) return exercise.trackId;
    }
    return readStoredTrack(isLanguageId) ?? 'python';
  });

  const setCurrentTrackId = (id: LanguageId) => {
    setCurrentTrackIdState(id);
    storeTrack(id);
  };

  const setCurrentExerciseId = (id: string) => {
    const exercise = findAnyExercise(id);
    if (exercise) setCurrentTrackId(exercise.trackId);
    setCurrentExerciseIdState(id);
    if (activeTab === 'workspace') replaceExerciseInUrl(id);
  };

  // Navigating between tabs loads another document.
  const setActiveTab = (tab: NavigationTab) => {
    if (tab === activeTab) return;
    navigateToTab(tab);
  };

  const [sandboxCode, setSandboxCodeState] = useState<Record<LanguageId, string>>(() => {
    try {
      const saved = localStorage.getItem('devpulse_sandbox_code');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SANDBOX_CODE;
  });

  const [sandboxLanguage, setSandboxLanguageState] = useState<LanguageId>(() => {
    // Persisted so "fork to playground" lands on the right language after the
    // full page load.
    try {
      const saved = localStorage.getItem('devpulse_sandbox_language');
      if (saved && isLanguageId(saved)) return saved;
    } catch {}
    return 'javascript';
  });

  const setSandboxLanguage = (lang: LanguageId) => {
    setSandboxLanguageState(lang);
    try {
      localStorage.setItem('devpulse_sandbox_language', lang);
    } catch {}
  };
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_forum_posts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_FORUM_POSTS;
  });

  const [badgeNotification, setBadgeNotification] = useState<Badge | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('devpulse_user_profile', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('devpulse_sandbox_code', JSON.stringify(sandboxCode));
    } catch {}
  }, [sandboxCode]);

  useEffect(() => {
    try {
      localStorage.setItem('devpulse_forum_posts', JSON.stringify(forumPosts));
    } catch {}
  }, [forumPosts]);

  useEffect(() => {
    try {
      localStorage.setItem('devpulse_sandbox_language', sandboxLanguage);
    } catch {}
  }, [sandboxLanguage]);

  useEffect(() => {
    if (!convexData?.enabled || !convexData.data) return;

    const remote = convexData.data;
    if (!remote.profile || !remote.forumPosts || !remote.sandboxCode || !remote.sandboxLanguage) {
      if (initializationStartedRef.current) return;
      initializationStartedRef.current = true;
      void convexData
        .initialize({ profile: userRef.current, forumPosts, sandboxCode, sandboxLanguage })
        .catch((error: unknown) => {
          initializationStartedRef.current = false;
          setSyncError(error instanceof Error ? error.message : String(error));
        });
      return;
    }

    const profile = normalizeUser(remote.profile, dateKey());
    const nextSnapshot = {
      profile: JSON.stringify(remote.profile),
      forumPosts: JSON.stringify(remote.forumPosts),
      sandboxCode: JSON.stringify(remote.sandboxCode),
      sandboxLanguage: JSON.stringify(remote.sandboxLanguage),
    };
    const previousSnapshot = cloudSnapshotRef.current;
    cloudSnapshotRef.current = nextSnapshot;
    cloudReadyRef.current = true;

    if (!previousSnapshot || previousSnapshot.profile !== nextSnapshot.profile) {
      if (JSON.stringify(profile) !== JSON.stringify(userRef.current)) commitUser(profile);
    }
    if (!previousSnapshot || previousSnapshot.forumPosts !== nextSnapshot.forumPosts) {
      setForumPosts(current =>
        JSON.stringify(current) === nextSnapshot.forumPosts ? current : remote.forumPosts!
      );
    }
    if (!previousSnapshot || previousSnapshot.sandboxCode !== nextSnapshot.sandboxCode) {
      setSandboxCodeState(current =>
        JSON.stringify(current) === nextSnapshot.sandboxCode ? current : remote.sandboxCode!
      );
    }
    if (!previousSnapshot || previousSnapshot.sandboxLanguage !== nextSnapshot.sandboxLanguage) {
      setSandboxLanguageState(current =>
        JSON.stringify(current) === nextSnapshot.sandboxLanguage
          ? current
          : remote.sandboxLanguage!
      );
    }
  }, [convexData?.data, convexData?.enabled, forumPosts, sandboxCode, sandboxLanguage, syncRetry]);

  useEffect(() => {
    if (!convexData?.enabled || !cloudReadyRef.current) return;
    const value = JSON.stringify(user);
    if (cloudSnapshotRef.current?.profile === value) return;

    const previousValue = cloudSnapshotRef.current?.profile ?? '';
    cloudSnapshotRef.current = { ...cloudSnapshotRef.current!, profile: value };
    void convexData.saveProfile(user).then(
      () => setSyncError(null),
      (error: unknown) => {
        if (cloudSnapshotRef.current?.profile === value) {
          cloudSnapshotRef.current = { ...cloudSnapshotRef.current, profile: previousValue };
        }
        setSyncError(error instanceof Error ? error.message : String(error));
      }
    );
  }, [user, convexData, syncRetry]);

  useEffect(() => {
    if (!convexData?.enabled || !cloudReadyRef.current) return;
    const value = JSON.stringify(forumPosts);
    if (cloudSnapshotRef.current?.forumPosts === value) return;

    const previousValue = cloudSnapshotRef.current?.forumPosts ?? '';
    cloudSnapshotRef.current = { ...cloudSnapshotRef.current!, forumPosts: value };
    void convexData.saveForumPosts(forumPosts).then(
      () => setSyncError(null),
      (error: unknown) => {
        if (cloudSnapshotRef.current?.forumPosts === value) {
          cloudSnapshotRef.current = { ...cloudSnapshotRef.current, forumPosts: previousValue };
        }
        setSyncError(error instanceof Error ? error.message : String(error));
      }
    );
  }, [forumPosts, convexData, syncRetry]);

  useEffect(() => {
    if (!convexData?.enabled || !cloudReadyRef.current) return;
    const value = JSON.stringify(sandboxCode);
    if (cloudSnapshotRef.current?.sandboxCode === value) return;

    const previousValue = cloudSnapshotRef.current?.sandboxCode ?? '';
    cloudSnapshotRef.current = { ...cloudSnapshotRef.current!, sandboxCode: value };
    void convexData.saveSandboxCode(sandboxCode).then(
      () => setSyncError(null),
      (error: unknown) => {
        if (cloudSnapshotRef.current?.sandboxCode === value) {
          cloudSnapshotRef.current = { ...cloudSnapshotRef.current, sandboxCode: previousValue };
        }
        setSyncError(error instanceof Error ? error.message : String(error));
      }
    );
  }, [sandboxCode, convexData, syncRetry]);

  useEffect(() => {
    if (!convexData?.enabled || !cloudReadyRef.current) return;
    const value = JSON.stringify(sandboxLanguage);
    if (cloudSnapshotRef.current?.sandboxLanguage === value) return;

    const previousValue = cloudSnapshotRef.current?.sandboxLanguage ?? '';
    cloudSnapshotRef.current = { ...cloudSnapshotRef.current!, sandboxLanguage: value };
    void convexData.saveSandboxLanguage(sandboxLanguage).then(
      () => setSyncError(null),
      (error: unknown) => {
        if (cloudSnapshotRef.current?.sandboxLanguage === value) {
          cloudSnapshotRef.current = { ...cloudSnapshotRef.current, sandboxLanguage: previousValue };
        }
        setSyncError(error instanceof Error ? error.message : String(error));
      }
    );
  }, [sandboxLanguage, convexData, syncRetry]);

  const retryCloudSync = () => setSyncRetry(retry => retry + 1);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
      });
    } catch {
      // ignore
    }
  };

  const setSandboxCode = (lang: LanguageId, code: string) => {
    setSandboxCodeState(prev => ({ ...prev, [lang]: code }));
  };

  const selectExercise = (exerciseId: string) => {
    const ex = findAnyExercise(exerciseId);
    if (ex) setCurrentTrackId(ex.trackId);
    setCurrentExerciseIdState(exerciseId);
    navigateToTab('workspace', `?exercise=${encodeURIComponent(exerciseId)}`);
  };

  const forkCodeToSandbox = (code: string, language: LanguageId) => {
    // Persist synchronously: the tab change below triggers a full page load, so
    // effects would never get a chance to flush the state.
    const nextCode = { ...sandboxCode, [language]: code };
    setSandboxCodeState(nextCode);
    setSandboxLanguage(language);
    try {
      localStorage.setItem('devpulse_sandbox_code', JSON.stringify(nextCode));
    } catch {}
    navigateToTab('sandbox');
  };

  const announce = (r: AwardResult) => {
    if (r.leveledUpTo) {
      setLevelUpNotification(r.leveledUpTo);
      triggerConfetti();
    }
    if (r.newBadgeIds.length > 0) {
      const b = BADGES.find(x => x.id === r.newBadgeIds[0]);
      if (b) setBadgeNotification(b);
    }
  };

  const addXp = (amount: number, countsForStreak = true) => {
    const result = awardXp(userRef.current, amount, dateKey(), BADGE_CONTEXT, countsForStreak);
    commitUser(result.user);
    announce(result);
  };

  const completeExercise = (exerciseId: string, submittedCode: string, xpEarned: number) => {
    const prev = userRef.current;
    const isAlreadySolved = Boolean(prev.solvedExercises[exerciseId]);
    const xpToAward = isAlreadySolved ? Math.round(xpEarned * 0.25) : xpEarned;

    commitUser({
      ...prev,
      solvedExercises: {
        ...prev.solvedExercises,
        [exerciseId]: { passedAt: new Date().toISOString(), code: submittedCode }
      }
    });

    addXp(xpToAward, true);
    triggerConfetti();
  };

  const solveDailyChallenge = (submittedCode: string, xpEarned: number) => {
    const today = dateKey();
    const prev = userRef.current;
    if (prev.dailyChallengeSolvedDate === today) return; // already rewarded today

    const todayChallenge = getTodayChallenge();
    const unlocked = [...prev.unlockedBadgeIds];
    if (!unlocked.includes('daily-hunter')) {
      unlocked.push('daily-hunter');
      const b = BADGES.find(x => x.id === 'daily-hunter');
      if (b) setBadgeNotification(b);
    }

    commitUser({
      ...prev,
      dailyChallengeSolvedDate: today,
      solvedExercises: {
        ...prev.solvedExercises,
        [todayChallenge.id]: { passedAt: new Date().toISOString(), code: submittedCode }
      },
      unlockedBadgeIds: unlocked
    });

    addXp(xpEarned, true);
    triggerConfetti();
  };

  // Freezes are now spent automatically when a day is missed (see advanceStreak).
  // This manual version is kept so existing UI code keeps working.
  const useStreakFreeze = (): boolean => {
    const prev = userRef.current;
    if (prev.streakFreezes <= 0) return false;
    commitUser({ ...prev, streakFreezes: prev.streakFreezes - 1 });
    return true;
  };

  const buyStreakFreeze = (xpCost: number): boolean => {
    const next = purchaseStreakFreeze(userRef.current, xpCost);
    if (!next) return false;
    commitUser(next);
    return true;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    commitUser({ ...userRef.current, ...updates });
  };

  // Forum actions
  const createForumPost = (
    postData: Omit<
      ForumPost,
      'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorAvatarBg' | 'createdAt' | 'upvotes' | 'commentsCount' | 'comments'
    >
  ) => {
    const newPost: ForumPost = {
      ...postData,
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.displayName,
      authorAvatar: user.avatarSeed,
      authorAvatarBg: user.avatarBg,
      createdAt: 'Just now',
      upvotes: 1,
      commentsCount: 0,
      comments: []
    };

    setForumPosts(prev => [newPost, ...prev]);
    addXp(25, false);

    // Check project architect badge
    if (postData.category === 'projects' || postData.isCollaborative) {
      const p = userRef.current;
      if (!p.unlockedBadgeIds.includes('project-architect')) {
        commitUser({ ...p, unlockedBadgeIds: [...p.unlockedBadgeIds, 'project-architect'] });
        const b = BADGES.find(x => x.id === 'project-architect');
        if (b) setBadgeNotification(b);
      }
    }
  };

  const upvoteForumPost = (postId: string) => {
    const prevUser = userRef.current;
    const already = (prevUser.upvotedPostIds ?? []).includes(postId);
    commitUser({
      ...prevUser,
      upvotedPostIds: already
        ? (prevUser.upvotedPostIds ?? []).filter(id => id !== postId)
        : [...(prevUser.upvotedPostIds ?? []), postId]
    });
    setForumPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, upvotes: Math.max(0, p.upvotes + (already ? -1 : 1)) } : p
      )
    );
  };

  const addCommentToPost = (postId: string, content: string) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: user.id,
      authorName: user.displayName,
      authorAvatar: user.avatarSeed,
      authorAvatarBg: user.avatarBg,
      content,
      createdAt: 'Just now',
      upvotes: 0
    };

    setForumPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, comment]
          };
        }
        return p;
      })
    );

    addXp(15, false);
  };

  const markAnswerAccepted = (postId: string, commentId: string) => {
    setForumPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isResolved: true,
            hasAcceptedAnswer: true,
            comments: p.comments.map(c => ({
              ...c,
              isAcceptedAnswer: c.id === commentId
            }))
          };
        }
        return p;
      })
    );
  };

  const toggleStarProject = (postId: string) => {
    const prev = userRef.current;
    const isStarred = prev.starredProjectIds.includes(postId);
    commitUser({
      ...prev,
      starredProjectIds: isStarred
        ? prev.starredProjectIds.filter(id => id !== postId)
        : [...prev.starredProjectIds, postId]
    });
  };

  const dismissBadgeNotification = () => setBadgeNotification(null);
  const dismissLevelUpNotification = () => setLevelUpNotification(null);

  // Compute dynamic leaderboard placing current user accurately
  const currentUserEntry: LeaderboardUser = {
    id: user.id,
    rank: 1, // Will be computed
    username: user.username,
    displayName: user.displayName,
    avatarSeed: user.avatarSeed,
    avatarBg: user.avatarBg,
    weeklyXp: user.weeklyXp ?? 0,
    totalXp: user.totalXpEarned ?? user.currentXp,
    streak: user.streak,
    league: user.league,
    topLanguage: currentTrackId,
    isCurrentUser: true
  };

  const allLeaderboardUsers: LeaderboardUser[] = [
    ...SEED_LEADERBOARD.filter(u => u.id !== user.id),
    currentUserEntry
  ]
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const userRank = allLeaderboardUsers.find(u => u.isCurrentUser)?.rank || 1;

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        currentTrackId,
        setCurrentTrackId,
        currentExerciseId,
        setCurrentExerciseId,
        selectExercise,
        completeExercise,
        solveDailyChallenge,
        sandboxCode,
        setSandboxCode,
        sandboxLanguage,
        setSandboxLanguage,
        forkCodeToSandbox,
        forumPosts,
        createForumPost,
        upvoteForumPost,
        addCommentToPost,
        markAnswerAccepted,
        toggleStarProject,
        useStreakFreeze,
        buyStreakFreeze,
        updateUserProfile,
        badgeNotification,
        dismissBadgeNotification,
        levelUpNotification,
        dismissLevelUpNotification,
        leaderboardUsers: allLeaderboardUsers,
        userRank,
        cloudSyncEnabled: convexData?.enabled ?? false,
        syncError,
        retryCloudSync,
        triggerConfetti
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
