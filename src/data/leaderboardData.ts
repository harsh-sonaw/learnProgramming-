import { LeaderboardUser } from '../types';

export const SEED_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'user-top-1',
    rank: 1,
    username: 'sora_dev',
    displayName: 'Sora Takahashi',
    avatarSeed: 'sora',
    avatarBg: 'bg-emerald-600',
    weeklyXp: 1420,
    totalXp: 18450,
    streak: 42,
    league: 'Diamond',
    topLanguage: 'typescript'
  },
  {
    id: 'user-top-2',
    rank: 2,
    username: 'elena_py',
    displayName: 'Elena Voronova',
    avatarSeed: 'elena',
    avatarBg: 'bg-amber-600',
    weeklyXp: 1250,
    totalXp: 15300,
    streak: 28,
    league: 'Diamond',
    topLanguage: 'python'
  },
  {
    id: 'user-top-3',
    rank: 3,
    username: 'gopher_ken',
    displayName: 'Kenji Sato',
    avatarSeed: 'kenji',
    avatarBg: 'bg-cyan-600',
    weeklyXp: 1120,
    totalXp: 12890,
    streak: 35,
    league: 'Diamond',
    topLanguage: 'go'
  },
  {
    id: 'user-4',
    rank: 4,
    username: 'dev_maya',
    displayName: 'Maya Lin',
    avatarSeed: 'maya',
    avatarBg: 'bg-purple-600',
    weeklyXp: 940,
    totalXp: 9450,
    streak: 19,
    league: 'Platinum',
    topLanguage: 'javascript'
  },
  {
    id: 'user-5',
    rank: 5,
    username: 'sql_sam',
    displayName: 'Samuel Osei',
    avatarSeed: 'samuel',
    avatarBg: 'bg-teal-600',
    weeklyXp: 810,
    totalXp: 8200,
    streak: 14,
    league: 'Platinum',
    topLanguage: 'sql'
  },
  {
    id: 'user-6',
    rank: 6,
    username: 'rust_ace',
    displayName: 'Lucas Vance',
    avatarSeed: 'lucas',
    avatarBg: 'bg-orange-600',
    weeklyXp: 750,
    totalXp: 7100,
    streak: 11,
    league: 'Gold',
    topLanguage: 'python'
  },
  {
    id: 'user-7',
    rank: 7,
    username: 'chloe_codes',
    displayName: 'Chloe Dupont',
    avatarSeed: 'chloe',
    avatarBg: 'bg-rose-600',
    weeklyXp: 620,
    totalXp: 5400,
    streak: 8,
    league: 'Gold',
    topLanguage: 'typescript'
  },
  {
    id: 'user-8',
    rank: 8,
    username: 'amir_tech',
    displayName: 'Amir Reza',
    avatarSeed: 'amir',
    avatarBg: 'bg-blue-600',
    weeklyXp: 530,
    totalXp: 4300,
    streak: 6,
    league: 'Silver',
    topLanguage: 'javascript'
  },
  {
    id: 'user-9',
    rank: 9,
    username: 'nina_k',
    displayName: 'Nina Kowalski',
    avatarSeed: 'nina',
    avatarBg: 'bg-indigo-600',
    weeklyXp: 410,
    totalXp: 3100,
    streak: 5,
    league: 'Silver',
    topLanguage: 'python'
  },
  {
    id: 'user-10',
    rank: 10,
    username: 'carlos_r',
    displayName: 'Carlos Rivera',
    avatarSeed: 'carlos',
    avatarBg: 'bg-pink-600',
    weeklyXp: 350,
    totalXp: 2400,
    streak: 4,
    league: 'Bronze',
    topLanguage: 'sql'
  }
];

export const LEAGUE_TIERS = [
  { name: 'Bronze', minXp: 0, color: 'text-amber-700', bg: 'bg-amber-950/40 border-amber-800/40' },
  { name: 'Silver', minXp: 300, color: 'text-slate-300', bg: 'bg-slate-800/60 border-slate-600/40' },
  { name: 'Gold', minXp: 600, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-700/40' },
  { name: 'Platinum', minXp: 900, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-700/40' },
  { name: 'Diamond', minXp: 1200, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-700/40' },
  { name: 'Master', minXp: 2000, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-700/40' }
];
