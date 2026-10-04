import React from 'react';
import { Award, Zap, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationModals: React.FC = () => {
  const { 
    badgeNotification, 
    dismissBadgeNotification, 
    levelUpNotification, 
    dismissLevelUpNotification,
    setActiveTab 
  } = useApp();

  return (
    <>
      {/* Badge Notification Toast/Modal */}
      {badgeNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-amber-500/10 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Achievement Unlocked!
                </span>
                <button 
                  onClick={dismissBadgeNotification}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5 truncate">{badgeNotification.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{badgeNotification.description}</p>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">Rarity: {badgeNotification.rarity}</span>
                <button 
                  onClick={() => {
                    dismissBadgeNotification();
                    setActiveTab('profile');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
                >
                  View Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpNotification !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">
              <Zap className="w-10 h-10 fill-emerald-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Level Ascended
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Level {levelUpNotification}!</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-xs mx-auto">
              Your programming mastery is scaling up! You have unlocked higher league placement and bonus leaderboard standing.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={dismissLevelUpNotification}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
              >
                Keep Hacking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
