import React from 'react';
import { 
  Terminal, 
  Code2, 
  Layers, 
  Cpu, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Award,
  PlayCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES, COURSES } from '../data/courses';
import { LanguageId } from '../types';

export const TracksView: React.FC = () => {
  const { 
    currentTrackId, 
    setCurrentTrackId, 
    selectExercise, 
    user,
    setActiveTab 
  } = useApp();

  const activeTrack = COURSES[currentTrackId];
  const allTrackExercises = activeTrack?.modules.flatMap(m => m.exercises) || [];
  const solvedCount = allTrackExercises.filter(e => user.solvedExercises[e.id]).length;
  const progressPercent = allTrackExercises.length > 0 
    ? Math.round((solvedCount / allTrackExercises.length) * 100) 
    : 0;

  const getLanguageIcon = (id: LanguageId, className = "w-5 h-5") => {
    switch (id) {
      case 'python': return <Terminal className={className} />;
      case 'javascript': return <Code2 className={className} />;
      case 'typescript': return <Layers className={className} />;
      case 'go': return <Cpu className={className} />;
      case 'sql': return <Database className={className} />;
      default: return <Code2 className={className} />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-400';
      case 'Intermediate': return 'text-amber-400';
      case 'Advanced': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  // Find next unsolved exercise to recommend
  const nextUnsolved = allTrackExercises.find(e => !user.solvedExercises[e.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Language Track Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Select Programming Track
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {Object.keys(user.solvedExercises).length} exercises solved total
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LANGUAGES.map(lang => {
            const isSelected = currentTrackId === lang.id;
            const langCourse = COURSES[lang.id];
            const langExs = langCourse?.modules.flatMap(m => m.exercises) || [];
            const solved = langExs.filter(e => user.solvedExercises[e.id]).length;
            const pct = langExs.length > 0 ? Math.round((solved / langExs.length) * 100) : 0;

            return (
              <button
                key={lang.id}
                onClick={() => setCurrentTrackId(lang.id)}
                className={`flex flex-col p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/40' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-slate-800 text-slate-200 group-hover:scale-105 transition-transform ${isSelected ? 'text-emerald-400 bg-emerald-950/40' : ''}`}>
                    {getLanguageIcon(lang.id, "w-4 h-4")}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {solved}/{langExs.length}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{lang.name}</h3>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">{lang.popularFor}</span>

                {/* Micro progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Track Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                {getLanguageIcon(currentTrackId, "w-6 h-6")}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{activeTrack.name}</h1>
                <p className="text-xs font-mono text-emerald-400">{activeTrack.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {activeTrack.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent"/>
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-emerald-400" fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-white">{progressPercent}%</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">Track Mastery</span>
                <span className="text-sm font-bold text-white">{solvedCount} of {allTrackExercises.length} solved</span>
              </div>
            </div>

            {nextUnsolved ? (
              <button
                onClick={() => selectExercise(nextUnsolved.id)}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Continue: {nextUnsolved.title}</span>
              </button>
            ) : (
              <div className="px-5 py-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Track Completed!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Modules & Interactive Exercises */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Curriculum Roadmap & Challenges
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {activeTrack.modules.length} Module(s)
          </span>
        </div>

        {activeTrack.modules.map((mod, modIdx) => (
          <div key={mod.id} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Module {modIdx + 1}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{mod.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {mod.exercises.filter(e => user.solvedExercises[e.id]).length} / {mod.exercises.length} Completed
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {mod.exercises.map((exercise, exIdx) => {
                const isSolved = Boolean(user.solvedExercises[exercise.id]);

                return (
                  <div
                    key={exercise.id}
                    className="p-4 sm:p-5 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {isSolved ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-mono text-slate-400 font-bold">
                            {exIdx + 1}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => selectExercise(exercise.id)}>
                            {exercise.title}
                          </h4>
                          <span className={`text-[11px] font-mono ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {exercise.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-950/30 border border-amber-800/40 px-2 py-1 rounded">
                        +{exercise.xpReward} XP
                      </span>

                      <button
                        onClick={() => selectExercise(exercise.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSolved 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 active:scale-95'
                        }`}
                      >
                        <span>{isSolved ? 'Review' : 'Solve'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
