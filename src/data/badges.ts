import { Badge } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'first-code',
    title: 'Hello, World!',
    description: 'Executed and passed your first automated test suite.',
    icon: 'Sparkles',
    category: 'mastery',
    rarity: 'Common'
  },
  {
    id: 'streak-3',
    title: 'Spark of Consistency',
    description: 'Maintained an unbroken daily coding streak for 3 days.',
    icon: 'Flame',
    category: 'streak',
    rarity: 'Common'
  },
  {
    id: 'streak-7',
    title: 'Relentless Momentum',
    description: 'Conquered a full 7-day daily sprint streak.',
    icon: 'Zap',
    category: 'streak',
    rarity: 'Rare'
  },
  {
    id: 'polyglot',
    title: 'The Polyglot',
    description: 'Successfully completed exercises in at least 2 distinct programming languages.',
    icon: 'Globe',
    category: 'language',
    rarity: 'Rare'
  },
  {
    id: 'xp-500',
    title: 'Code Centurion',
    description: 'Accumulated over 500 total developer XP.',
    icon: 'Award',
    category: 'xp',
    rarity: 'Common'
  },
  {
    id: 'xp-1000',
    title: 'Algorithmic Vanguard',
    description: 'Surpassed 1,000 developer XP in competitive challenges.',
    icon: 'Crown',
    category: 'xp',
    rarity: 'Epic'
  },
  {
    id: 'daily-hunter',
    title: 'Daily Sprinter',
    description: 'Solved the official Daily Code Challenge.',
    icon: 'Clock',
    category: 'mastery',
    rarity: 'Rare'
  },
  {
    id: 'community-beacon',
    title: 'Community Beacon',
    description: 'Contributed knowledge or shared code in the peer forums.',
    icon: 'MessageSquare',
    category: 'community',
    rarity: 'Common'
  },
  {
    id: 'project-architect',
    title: 'Open Source Architect',
    description: 'Published a collaborative community project for peers to fork and run.',
    icon: 'FolderGit2',
    category: 'community',
    rarity: 'Epic'
  },
  {
    id: 'sql-sorcerer',
    title: 'Relational Alchemist',
    description: 'Mastered SQL aggregations and relational table joins.',
    icon: 'Database',
    category: 'language',
    rarity: 'Rare'
  }
];
