import React from 'react';
import { 
  Code2, 
  Flame, 
  Trophy, 
  MessageSquare, 
  Sparkles, 
  User, 
  Terminal, 
  ShieldAlert,
  Zap,
  BookOpen
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    setStreakModalOpen 
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'tracks', label: 'Tracks', icon: <BookOpen className="w-4 h-4" /> },
    { 
      id: 'daily', 
      label: 'Daily Sprint', 
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      badge: !user.dailyChallengeSolvedDate ? 'New' : undefined 
    },
    { id: 'sandbox', label: 'Playground', icon: <Terminal className="w-4 h-4" /> },
    { id: 'leaderboards', label: 'Leaderboard', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Calculate XP percentage to next level
  const prevLevelXp = user.level === 1 ? 0 : [0, 200, 450, 750, 1150, 1650, 2250, 3000][user.level - 1] || 0;
  const xpInCurrentLevel = user.currentXp - prevLevelXp;
  const xpNeeded = user.nextLevelXp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / (xpNeeded || 1)) * 100)));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('tracks')}
            className="flex items-center gap-2.5 group text-left transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
              <Code2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                DevPulse
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Academy</span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700/60' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] font-semibold text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Gamification Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Flame Button */}
          <button
            onClick={() => setStreakModalOpen(true)}
            title="Open Streak Details & Protection"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 text-amber-300 text-xs font-semibold font-mono transition-all group"
          >
            <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/20" />
            <span>{user.streak}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">days</span>
          </button>

          {/* Streak Freeze Indicator */}
          <button
            onClick={() => setStreakModalOpen(true)}
            title={`${user.streakFreezes} Streak Freeze(s) available`}
            className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-800/30 text-cyan-300 text-xs font-mono"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>{user.streakFreezes}</span>
          </button>

          {/* Level & XP Bar */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="hidden sm:flex flex-col gap-1 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-emerald-400 font-mono">Lvl {user.level}</span>
              <span className="text-[11px] text-slate-400 font-mono">{user.currentXp} XP</span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-md hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-md ${user.avatarBg} flex items-center justify-center text-white text-xs font-bold shadow`}>
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user.displayName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{user.league} League</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-900 bg-slate-950/95 py-2 px-2 overflow-x-auto text-xs">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md font-medium ${
              activeTab === item.id ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
