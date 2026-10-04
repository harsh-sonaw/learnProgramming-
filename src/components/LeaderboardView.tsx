import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Medal, 
  Crown, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Database,
  ArrowUp,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEAGUE_TIERS } from '../data/leaderboardData';
import { LanguageId } from '../types';

export const LeaderboardView: React.FC = () => {
  const { leaderboardUsers, user, userRank } = useApp();
  const [filterType, setFilterType] = useState<'weekly' | 'alltime' | 'language'>('weekly');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('typescript');

  // Filter users based on tab
  let displayUsers = [...leaderboardUsers];
  if (filterType === 'alltime') {
    displayUsers.sort((a, b) => b.totalXp - a.totalXp);
  } else if (filterType === 'language') {
    displayUsers = displayUsers.filter(u => u.topLanguage === selectedLanguage);
  }

  // Assign updated ranks
  displayUsers = displayUsers.map((u, i) => ({ ...u, rank: i + 1 }));

  const topThree = displayUsers.slice(0, 3);
  const restUsers = displayUsers.slice(3);

  const getLanguageTag = (lang: string) => {
    switch (lang) {
      case 'python': return 'PY';
      case 'javascript': return 'JS';
      case 'typescript': return 'TS';
      case 'go': return 'GO';
      case 'sql': return 'SQL';
      default: return lang.toUpperCase();
    }
  };

  const getLeagueTier = (leagueName: string) => {
    return LEAGUE_TIERS.find(l => l.name === leagueName) || LEAGUE_TIERS[0];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Global Developer Arena
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-700/40 font-bold">
              {user.league} League
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compete with peers worldwide. Weekly sprints conclude every Sunday at 23:59 UTC.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setFilterType('weekly')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'weekly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Sprint
          </button>
          <button
            onClick={() => setFilterType('alltime')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'alltime' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time XP
          </button>
          <button
            onClick={() => setFilterType('language')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'language' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Language
          </button>
        </div>
      </div>

      {/* Language Filter selector if active */}
      {filterType === 'language' && (
        <div className="flex items-center gap-2">
          {(['python', 'javascript', 'typescript', 'go', 'sql'] as LanguageId[]).map(l => (
            <button
              key={l}
              onClick={() => setSelectedLanguage(l)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors ${
                selectedLanguage === l
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Top 3 Podium Visual */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 pt-6 pb-2 items-end max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="flex flex-col items-center order-1">
            <div className={`w-14 h-14 rounded-2xl ${topThree[1].avatarBg} flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-slate-400/20 mb-2 relative`}>
              {topThree[1].displayName.charAt(0)}
              <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-slate-400 text-slate-950 font-mono text-[10px] font-bold">
                #2
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[100px]">{topThree[1].displayName}</span>
            <span className="text-[11px] font-mono text-slate-400">
              {filterType === 'alltime' ? topThree[1].totalXp : topThree[1].weeklyXp} XP
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-slate-900 to-slate-800/80 rounded-t-xl border border-slate-700/60 mt-2 flex items-center justify-center">
              <Medal className="w-6 h-6 text-slate-300" />
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center order-2 -mt-4">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className={`w-16 h-16 rounded-2xl ${topThree[0].avatarBg} flex items-center justify-center text-white text-xl font-bold shadow-xl ring-4 ring-yellow-400/30`}>
                {topThree[0].displayName.charAt(0)}
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-mono text-xs font-bold">
                #1
              </span>
            </div>
            <span className="text-sm font-extrabold text-white truncate max-w-[120px]">{topThree[0].displayName}</span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {filterType === 'alltime' ? topThree[0].totalXp : topThree[0].weeklyXp} XP
            </span>
            <div className="w-full h-32 bg-gradient-to-t from-yellow-950/40 via-slate-900 to-slate-800 rounded-t-xl border border-yellow-500/40 mt-2 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center order-3">
            <div className={`w-14 h-14 rounded-2xl ${topThree[2].avatarBg} flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-amber-700/20 mb-2 relative`}>
              {topThree[2].displayName.charAt(0)}
              <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-amber-600 text-slate-950 font-mono text-[10px] font-bold">
                #3
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[100px]">{topThree[2].displayName}</span>
            <span className="text-[11px] font-mono text-slate-400">
              {filterType === 'alltime' ? topThree[2].totalXp : topThree[2].weeklyXp} XP
            </span>
            <div className="w-full h-20 bg-gradient-to-t from-slate-900 to-slate-800/80 rounded-t-xl border border-slate-700/60 mt-2 flex items-center justify-center">
              <Medal className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Current User Ranking Status Sticky Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono">
            #{userRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{user.displayName} (You)</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{user.league} Tier</span>
            </div>
            <p className="text-xs text-slate-400">
              {userRank <= 3 
                ? '🏆 In promotion zone! You are on track to advance to the next tier.' 
                : 'Keep practicing to climb into the top 3 promotion podium!'}
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-sm font-bold text-white">{user.currentXp} XP</span>
          <span className="text-[11px] text-amber-400 block flex items-center justify-end gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400" /> {user.streak} days
          </span>
        </div>
      </div>

      {/* Standings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-6">
            <span className="w-8 text-center">Rank</span>
            <span>Developer</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">Top Language</span>
            <span className="hidden sm:inline">Streak</span>
            <span className="w-20 text-right">XP Earned</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {displayUsers.map(u => {
            const isMe = u.isCurrentUser || u.id === user.id;

            return (
              <div
                key={u.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                  isMe ? 'bg-emerald-950/20 border-l-4 border-l-emerald-400' : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 text-center font-mono font-bold text-xs ${
                    u.rank === 1 ? 'text-yellow-400' : u.rank === 2 ? 'text-slate-300' : u.rank === 3 ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    #{u.rank}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${u.avatarBg} flex items-center justify-center text-white text-xs font-bold`}>
                      {u.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{u.displayName}</span>
                        {isMe && (
                          <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 font-mono text-xs">
                  <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {getLanguageTag(u.topLanguage)}
                  </span>

                  <span className="hidden sm:flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {u.streak}d
                  </span>

                  <span className="w-20 text-right font-bold text-white">
                    {filterType === 'alltime' ? u.totalXp : u.weeklyXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
