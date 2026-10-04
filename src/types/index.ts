export type LanguageId = 'python' | 'javascript' | 'typescript' | 'go' | 'sql';

export interface LanguageInfo {
  id: LanguageId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  accentColor: string;
  description: string;
  popularFor: string;
  totalExercises: number;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TestCase {
  id: string;
  description: string;
  inputDescription: string;
  expectedOutputDescription: string;
  testFunctionCall?: string;
  expectedValue: any;
  isHidden?: boolean;
}

export interface Exercise {
  id: string;
  trackId: LanguageId;
  moduleId: string;
  moduleTitle: string;
  title: string;
  difficulty: Difficulty;
  xpReward: number;
  description: string;
  instructions: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints?: string[];
  starterCode: string;
  solutionCode: string;
  hints: string[];
  testCases: TestCase[];
}

export interface CourseModule {
  id: string;
  trackId: LanguageId;
  title: string;
  description: string;
  iconName: string;
  exercises: Exercise[];
}

export interface LanguageTrack {
  id: LanguageId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
  modules: CourseModule[];
}

export interface TestExecutionResult {
  testId: string;
  description: string;
  passed: boolean;
  actual: any;
  expected: any;
  error?: string;
  executionTimeMs: number;
}

export interface RunResults {
  success: boolean;
  allPassed: boolean;
  passedTests: number;
  totalTests: number;
  results: TestExecutionResult[];
  consoleOutput: string[];
  executionTimeMs: number;
  error?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'xp' | 'language' | 'community' | 'mastery';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
  avatarBg: string;
  joinedDate: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  solvedExercises: Record<string, { passedAt: string; code: string }>;
  unlockedBadgeIds: string[];
  starredProjectIds: string[];
  dailyChallengeSolvedDate?: string;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  xp: number;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  displayName: string;
  avatarSeed: string;
  avatarBg: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
  league: string;
  topLanguage: LanguageId;
  isCurrentUser?: boolean;
}

export type ForumCategory = 'all' | 'qna' | 'projects' | 'tips' | 'showcase';

export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorAvatarBg: string;
  content: string;
  createdAt: string;
  upvotes: number;
  isAcceptedAnswer?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: 'qna' | 'projects' | 'tips' | 'showcase';
  language: LanguageId | 'general';
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorAvatarBg: string;
  createdAt: string;
  upvotes: number;
  commentsCount: number;
  comments: ForumComment[];
  isResolved?: boolean;
  hasAcceptedAnswer?: boolean;
  codeSnippet?: string;
  codeLanguage?: LanguageId;
  projectUrl?: string;
  isCollaborative?: boolean;
  lookingForCollaborators?: boolean;
}
