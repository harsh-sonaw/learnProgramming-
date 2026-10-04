import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, LanguageId, ForumPost, Badge, LeaderboardUser } from '../types';
import { COURSES, ALL_EXERCISES } from '../data/courses';
import { BADGES } from '../data/badgesData';
import { SEED_FORUM_POSTS } from '../data/forumData';
import { SEED_LEADERBOARD, LEAGUE_TIERS } from '../data/leaderboardData';
import { getTodayChallenge } from '../data/challenges';
import {
  dateKey,
  awardXp,
  AwardResult,
  BadgeContext,
  normalizeUser,
  purchaseStreakFreeze,
} from '../utils/progress';

const BADGE_CONTEXT: BadgeContext = {
  exerciseTrack: Object.fromEntries(ALL_EXERCISES.map(e => [e.id, e.trackId])),
  sqlExerciseIds: (COURSES.sql?.modules.flatMap(m => m.exercises) || []).map(e => e.id),
};

export type NavigationTab =
  | 'tracks'
  | 'workspace'
  | 'daily'
  | 'sandbox'
  | 'leaderboards'
  | 'community'
  | 'profile';

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
  streakModalOpen: boolean;
  setStreakModalOpen: (open: boolean) => void;
  useStreakFreeze: () => boolean;
  buyStreakFreeze: (xpCost: number) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  badgeNotification: Badge | null;
  dismissBadgeNotification: () => void;
  levelUpNotification: number | null;
  dismissLevelUpNotification: () => void;
  leaderboardUsers: LeaderboardUser[];
  userRank: number;
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

  const [activeTab, setActiveTab] = useState<NavigationTab>('tracks');
  const [currentTrackId, setCurrentTrackId] = useState<LanguageId>('python');
  const [currentExerciseId, setCurrentExerciseId] = useState<string>('py-ex-1');

  const [sandboxCode, setSandboxCodeState] = useState<Record<LanguageId, string>>(() => {
    try {
      const saved = localStorage.getItem('devpulse_sandbox_code');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SANDBOX_CODE;
  });

  const [sandboxLanguage, setSandboxLanguage] = useState<LanguageId>('javascript');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    try {
      const saved = localStorage.getItem('devpulse_forum_posts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_FORUM_POSTS;
  });

  const [streakModalOpen, setStreakModalOpen] = useState(false);
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
    const ex = ALL_EXERCISES.find(e => e.id === exerciseId);
    if (ex) {
      setCurrentTrackId(ex.trackId);
    }
    setCurrentExerciseId(exerciseId);
    setActiveTab('workspace');
  };

  const forkCodeToSandbox = (code: string, language: LanguageId) => {
    setSandboxLanguage(language);
    setSandboxCode(language, code);
    setActiveTab('sandbox');
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
        streakModalOpen,
        setStreakModalOpen,
        useStreakFreeze,
        buyStreakFreeze,
        updateUserProfile,
        badgeNotification,
        dismissBadgeNotification,
        levelUpNotification,
        dismissLevelUpNotification,
        leaderboardUsers: allLeaderboardUsers,
        userRank,
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
