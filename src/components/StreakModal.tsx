import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, Calendar, Award, Zap, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StreakModal: React.FC = () => {
  const { 
    user, 
    streakModalOpen, 
    setStreakModalOpen, 
    buyStreakFreeze,
    useStreakFreeze,
    triggerConfetti 
  } = useApp();

  if (!streakModalOpen) return null;

  // Generate simulated 30-day streak timeline
  const today = new Date();
  const pastDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 27;
    // Active if within current streak days
    const daysAgo = 27 - i;
    const isActive = daysAgo < user.streak;
    return {
      date: dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isActive,
      isToday
    };
  });

  const milestones = [
    { days: 3, label: '3-Day Fire', reward: '+50 XP', unlocked: user.streak >= 3 },
    { days: 7, label: '7-Day Smasher', reward: '+150 XP & Rare Badge', unlocked: user.streak >= 7 },
    { days: 14, label: '14-Day Vanguard', reward: '+300 XP & Streak Freeze', unlocked: user.streak >= 14 },
    { days: 30, label: 'Monthly Master', reward: 'Diamond Crown & +1,000 XP', unlocked: user.streak >= 30 },
  ];

  const handleBuyFreeze = () => {
    const success = buyStreakFreeze(150);
    if (success) {
      triggerConfetti();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-amber-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Flame className="w-7 h-7 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Daily Streak Engine</h3>
                <span className="text-xs font-mono text-amber-400 font-semibold">{user.streak} Days Active</span>
              </div>
              <p className="text-xs text-slate-400">Keep solving 1 exercise or daily challenge every 24 hours</p>
            </div>
          </div>
          <button 
            onClick={() => setStreakModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-mono">Current</span>
              <span className="text-2xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-400 inline" />
                {user.streak}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-mono">Longest</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {user.longestStreak} d
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-mono">Freezes</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {user.streakFreezes}
              </span>
            </div>
          </div>

          {/* 4-Week Activity Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Past 4 Weeks Activity
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Today: {today.toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              {pastDays.map((d, i) => (
                <div 
                  key={i} 
                  title={`${d.date} - ${d.isActive ? 'Active streak day!' : 'No activity recorded'}`}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] font-mono transition-all ${
                    d.isActive 
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-slate-900/60 border border-slate-800/60 text-slate-500'
                  } ${d.isToday ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  <span className="text-[8px] text-slate-400">{d.dayName}</span>
                  <span>{d.dayNum}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Protection (Freeze) Section */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Streak Freeze Shield</h4>
                <p className="text-xs text-slate-400">
                  Protects your streak if you miss practicing for 1 full day.
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-cyan-300">
                  <span>Inventory: {user.streakFreezes} active</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleBuyFreeze}
              disabled={user.currentXp < 150}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all shrink-0 ${
                user.currentXp >= 150 
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Get Shield (150 XP)
            </button>
          </div>

          {/* Streak Milestones Ladder */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Streak Milestones & Rewards
            </h4>
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                    m.unlocked 
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {m.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono">
                        {m.days}
                      </div>
                    )}
                    <span className="font-semibold text-slate-200">{m.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400">{m.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setStreakModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
