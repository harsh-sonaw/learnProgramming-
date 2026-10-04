import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, LanguageId, ForumPost, Badge, LeaderboardUser } from '../types';
import { COURSES, ALL_EXERCISES } from '../data/courses';
import { BADGES } from '../data/badgesData';
import { SEED_FORUM_POSTS } from '../data/forumData';
import { SEED_LEADERBOARD, LEAGUE_TIERS } from '../data/leaderboardData';
import { getTodayChallenge } from '../data/challenges';

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
  lastActiveDate: new Date().toISOString().split('T')[0],
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
        // Ensure new fields exist
        return { ...INITIAL_USER, ...parsed };
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER;
  });

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

  const checkBadgeUnlocks = (updatedUser: UserProfile) => {
    const unlockedNow = [...updatedUser.unlockedBadgeIds];
    const totalSolved = Object.keys(updatedUser.solvedExercises).length;

    // First Code
    if (totalSolved >= 1 && !unlockedNow.includes('first-code')) {
      unlockedNow.push('first-code');
      const b = BADGES.find(x => x.id === 'first-code');
      if (b) setBadgeNotification(b);
    }

    // Streaks
    if (updatedUser.streak >= 3 && !unlockedNow.includes('streak-3')) {
      unlockedNow.push('streak-3');
      const b = BADGES.find(x => x.id === 'streak-3');
      if (b) setBadgeNotification(b);
    }
    if (updatedUser.streak >= 7 && !unlockedNow.includes('streak-7')) {
      unlockedNow.push('streak-7');
      const b = BADGES.find(x => x.id === 'streak-7');
      if (b) setBadgeNotification(b);
    }

    // Polyglot: check distinct languages solved
    const solvedLanguages = new Set<string>();
    for (const exId of Object.keys(updatedUser.solvedExercises)) {
      const ex = ALL_EXERCISES.find(e => e.id === exId);
      if (ex) solvedLanguages.add(ex.trackId);
    }
    if (solvedLanguages.size >= 2 && !unlockedNow.includes('polyglot')) {
      unlockedNow.push('polyglot');
      const b = BADGES.find(x => x.id === 'polyglot');
      if (b) setBadgeNotification(b);
    }

    // XP Milestones
    if (updatedUser.currentXp >= 500 && !unlockedNow.includes('xp-500')) {
      unlockedNow.push('xp-500');
      const b = BADGES.find(x => x.id === 'xp-500');
      if (b) setBadgeNotification(b);
    }
    if (updatedUser.currentXp >= 1000 && !unlockedNow.includes('xp-1000')) {
      unlockedNow.push('xp-1000');
      const b = BADGES.find(x => x.id === 'xp-1000');
      if (b) setBadgeNotification(b);
    }

    // SQL Sorcerer
    const sqlExercises = COURSES.sql?.modules.flatMap(m => m.exercises) || [];
    const sqlPassed = sqlExercises.every(e => updatedUser.solvedExercises[e.id]);
    if (sqlPassed && sqlExercises.length > 0 && !unlockedNow.includes('sql-sorcerer')) {
      unlockedNow.push('sql-sorcerer');
      const b = BADGES.find(x => x.id === 'sql-sorcerer');
      if (b) setBadgeNotification(b);
    }

    return unlockedNow;
  };

  const calculateLevel = (totalXp: number): { level: number; nextLevelXp: number } => {
    // 0-200 Lvl 1, 201-400 Lvl 2, 401-700 Lvl 3, 701-1100 Lvl 4, 1101-1600 Lvl 5, etc.
    const thresholds = [0, 200, 450, 750, 1150, 1650, 2250, 3000, 4000, 5500];
    let lvl = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (totalXp >= thresholds[i]) {
        lvl = i + 1;
      } else {
        return { level: lvl, nextLevelXp: thresholds[i] };
      }
    }
    return { level: lvl, nextLevelXp: thresholds[thresholds.length - 1] + 1500 };
  };

  const addXp = (amount: number, isStreakUpdate = true) => {
    setUser(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isNewActiveDay = prev.lastActiveDate !== today;
      let newStreak = prev.streak;

      if (isStreakUpdate && isNewActiveDay) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterday) {
          newStreak = prev.streak + 1;
        } else if (prev.streak === 0) {
          newStreak = 1;
        }
      }

      const longest = Math.max(prev.longestStreak, newStreak);
      const newXp = prev.currentXp + amount;
      const { level, nextLevelXp } = calculateLevel(newXp);

      if (level > prev.level) {
        setLevelUpNotification(level);
        triggerConfetti();
      }

      // League calculation based on XP
      let league = prev.league;
      if (newXp >= 1200) league = 'Diamond';
      else if (newXp >= 900) league = 'Platinum';
      else if (newXp >= 600) league = 'Gold';
      else if (newXp >= 300) league = 'Silver';

      const updated: UserProfile = {
        ...prev,
        currentXp: newXp,
        level,
        nextLevelXp,
        streak: newStreak,
        longestStreak: longest,
        lastActiveDate: today,
        league
      };

      updated.unlockedBadgeIds = checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const completeExercise = (exerciseId: string, submittedCode: string, xpEarned: number) => {
    const isAlreadySolved = Boolean(user.solvedExercises[exerciseId]);
    const xpToAward = isAlreadySolved ? Math.round(xpEarned * 0.25) : xpEarned;

    setUser(prev => {
      const updatedSolved = {
        ...prev.solvedExercises,
        [exerciseId]: {
          passedAt: new Date().toISOString(),
          code: submittedCode
        }
      };

      const updatedUser: UserProfile = {
        ...prev,
        solvedExercises: updatedSolved
      };

      return updatedUser;
    });

    addXp(xpToAward, true);
    triggerConfetti();
  };

  const solveDailyChallenge = (submittedCode: string, xpEarned: number) => {
    const today = new Date().toISOString().split('T')[0];
    const todayChallenge = getTodayChallenge();

    setUser(prev => {
      const updatedSolved = {
        ...prev.solvedExercises,
        [todayChallenge.id]: {
          passedAt: new Date().toISOString(),
          code: submittedCode
        }
      };

      const unlocked = [...prev.unlockedBadgeIds];
      if (!unlocked.includes('daily-hunter')) {
        unlocked.push('daily-hunter');
        const b = BADGES.find(x => x.id === 'daily-hunter');
        if (b) setBadgeNotification(b);
      }

      return {
        ...prev,
        dailyChallengeSolvedDate: today,
        solvedExercises: updatedSolved,
        unlockedBadgeIds: unlocked
      };
    });

    addXp(xpEarned, true);
    triggerConfetti();
  };

  const useStreakFreeze = (): boolean => {
    if (user.streakFreezes <= 0) return false;
    setUser(prev => ({
      ...prev,
      streakFreezes: prev.streakFreezes - 1
    }));
    return true;
  };

  const buyStreakFreeze = (xpCost: number): boolean => {
    if (user.currentXp < xpCost) return false;
    setUser(prev => ({
      ...prev,
      currentXp: prev.currentXp - xpCost,
      streakFreezes: prev.streakFreezes + 1
    }));
    return true;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
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
      setUser(prev => {
        if (!prev.unlockedBadgeIds.includes('project-architect')) {
          const b = BADGES.find(x => x.id === 'project-architect');
          if (b) setBadgeNotification(b);
          return {
            ...prev,
            unlockedBadgeIds: [...prev.unlockedBadgeIds, 'project-architect']
          };
        }
        return prev;
      });
    }
  };

  const upvoteForumPost = (postId: string) => {
    setForumPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
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
    setUser(prev => {
      const isStarred = prev.starredProjectIds.includes(postId);
      return {
        ...prev,
        starredProjectIds: isStarred
          ? prev.starredProjectIds.filter(id => id !== postId)
          : [...prev.starredProjectIds, postId]
      };
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
    weeklyXp: user.currentXp,
    totalXp: user.currentXp + 1500,
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
