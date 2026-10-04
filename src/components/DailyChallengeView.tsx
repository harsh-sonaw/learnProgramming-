import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  Award,
  Terminal,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayChallenge } from '../data/challenges';
import { runCode } from '../utils/codeRunner';

export const DailyChallengeView: React.FC = () => {
  const { 
    user, 
    selectExercise, 
    solveDailyChallenge, 
    triggerConfetti 
  } = useApp();

  const challenge = getTodayChallenge();
  const todayStr = new Date().toISOString().split('T')[0];
  const isSolvedToday = user.dailyChallengeSolvedDate === todayStr || Boolean(user.solvedExercises[challenge.id]);

  // Countdown timer to midnight
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 17,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalRewardXp = challenge.xpReward + challenge.bonusXp;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                Daily Sprint #{new Date().getDate()}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Resets in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {challenge.title}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {challenge.lore}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-right hidden sm:block font-mono">
              <span className="text-xs text-slate-400 block uppercase">Rewards</span>
              <span className="text-lg font-bold text-amber-400">+{totalRewardXp} XP</span>
              <span className="text-xs text-emerald-400 block">+1 Streak Day</span>
            </div>

            {isSolvedToday ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Sprint Conquered!</span>
              </div>
            ) : (
              <button
                onClick={() => selectExercise(challenge.id)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Solve Daily Sprint</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Blueprint & Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Problem Specification
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {challenge.description}
            </p>

            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Requirements
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {challenge.instructions.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono font-bold">{i + 1}.</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Sample Test Cases
              </h3>
              <div className="space-y-2">
                {challenge.examples.map((ex, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                    <div className="text-slate-400">
                      Input: <span className="text-white">{ex.input}</span>
                    </div>
                    <div className="text-slate-400">
                      Output: <span className="text-emerald-400">{ex.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => selectExercise(challenge.id)}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Full IDE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Gamification Sidebar Stats */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Streak Multiplier
            </h3>
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <span className="text-lg font-bold font-mono text-white">{user.streak} Days</span>
                <p className="text-[11px] text-amber-300/80">Solving today extends your streak to {user.streak + 1}!</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Base Problem XP</span>
                <span className="font-mono text-white">+{challenge.xpReward} XP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Daily Bonus XP</span>
                <span className="font-mono text-amber-400">+{challenge.bonusXp} XP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Streak Shield Protection</span>
                <span className="font-mono text-cyan-400">Active</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold">
                <span className="text-slate-200">Total Reward</span>
                <span className="font-mono text-emerald-400">+{totalRewardXp} XP</span>
              </div>
            </div>
          </div>

          {/* Daily Sprint Perks */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Daily Sprinter Badge
            </h3>
            <p className="text-xs text-slate-300">
              Complete any daily challenge to unlock the <span className="text-amber-400 font-semibold">"Daily Sprinter"</span> badge for your developer showcase profile.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Next challenge tomorrow at 00:00 UTC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
