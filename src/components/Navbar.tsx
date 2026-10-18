import React from 'react';
import { Code2, Flame, ArrowUpRight } from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

const navItems: { id: NavigationTab; label: string }[] = [
  { id: 'tracks', label: 'Learn' },
  { id: 'daily', label: 'Daily challenge' },
  { id: 'sandbox', label: 'Playground' },
  { id: 'leaderboards', label: 'Leaderboard' },
  { id: 'community', label: 'Community' },
];

export const Navbar: React.FC = () => {
  const { user, activeTab, setActiveTab, setStreakModalOpen } = useApp();

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <button onClick={() => setActiveTab('tracks')} className="flex items-center gap-2.5 text-white" aria-label="DevPulse home">
          <Code2 className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">devpulse<span className="text-emerald-400">.</span></span>
        </button>
        <div className="flex items-center gap-5 sm:gap-7">
          <button onClick={() => setStreakModalOpen(true)} className="flex items-center gap-2 text-sm text-slate-300" aria-label={`View your ${user.streak} day streak`}>
            <Flame className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>{user.streak}<span className="hidden sm:inline"> day streak</span></span>
          </button>
          <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2.5 text-sm text-slate-200" aria-label="Open your profile">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-medium">{user.displayName.charAt(0).toUpperCase()}</span>
            <span className="hidden sm:inline">{user.displayName}</span>
            <ArrowUpRight className="hidden h-3.5 w-3.5 text-slate-500 sm:block" aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-5 sm:gap-8 sm:px-8">
        {navItems.map(item => {
          const selected = activeTab === item.id || (item.id === 'tracks' && activeTab === 'workspace');
          return (
          <button key={item.id} onClick={() => setActiveTab(item.id)} aria-current={selected ? 'page' : undefined}
            className={`shrink-0 border-b-2 pb-3 pt-1 text-sm transition-colors ${selected ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {item.label}
          </button>
          );
        })}
      </nav>
    </header>
  );
};
