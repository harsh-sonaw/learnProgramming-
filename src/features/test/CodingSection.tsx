import React from 'react';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { COURSES } from '@/data/courses';
import { useAppStore } from '@/store';
import type { LanguageId } from '@/types';

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-amber-400',
  Advanced: 'text-rose-400',
};

export const CodingSection: React.FC<{ language: LanguageId }> = ({ language }) => {
  const solvedExercises = useAppStore((s) => s.user.solvedExercises);
  const selectExercise = useAppStore((s) => s.selectExercise);

  const modules = COURSES[language]?.modules ?? [];
  const exercises = modules.flatMap((m) => m.exercises);
  const solved = exercises.filter((e) => solvedExercises[e.id]).length;
  const nextUnsolved = exercises.find((e) => !solvedExercises[e.id]);

  if (exercises.length === 0) {
    return <p className="text-sm text-slate-400">No coding challenges for this language yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Coding challenges</h3>
            <p className="text-sm text-slate-400">
              Solve each one in the editor. Your code runs against hidden tests, with suggestions as you type.
            </p>
          </div>
          <span className="text-sm font-mono text-emerald-300 shrink-0">
            {solved}/{exercises.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${Math.round((solved / exercises.length) * 100)}%` }}
          />
        </div>
        {nextUnsolved && (
          <button
            type="button"
            onClick={() => selectExercise(nextUnsolved.id)}
            className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all"
          >
            <PlayCircle className="w-4 h-4" /> Continue: {nextUnsolved.title}
          </button>
        )}
      </div>

      {modules.map((mod) => (
        <div key={mod.id} className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
            <h4 className="text-sm font-bold text-white">{mod.title}</h4>
          </div>
          <ul className="divide-y divide-slate-800/70">
            {mod.exercises.map((exercise) => {
              const isSolved = Boolean(solvedExercises[exercise.id]);
              return (
                <li key={exercise.id} className="px-4 py-3 flex items-center gap-3">
                  {isSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{exercise.title}</p>
                    <p className="text-[11px] font-mono">
                      <span className={DIFFICULTY_STYLE[exercise.difficulty]}>{exercise.difficulty}</span>
                      <span className="text-slate-500"> · {exercise.xpReward} XP</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectExercise(exercise.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white"
                  >
                    {isSolved ? 'Review' : 'Solve'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
