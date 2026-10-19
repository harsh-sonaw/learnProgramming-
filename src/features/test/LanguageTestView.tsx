import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { gradeLabel, overallPercent } from '@/core/quiz';
import { COURSES, LANGUAGES } from '@/data/courses';
import { getMcqQuestions } from '@/data/mcq';
import { useAppStore } from '@/store';
import { CodingSection } from './CodingSection';
import { McqSection } from './McqSection';

type Section = 'mcq' | 'coding';

export const LanguageTestView: React.FC = () => {
  const { user, currentTrackId, setCurrentTrackId } = useAppStore(
    useShallow((s) => ({
      user: s.user,
      currentTrackId: s.currentTrackId,
      setCurrentTrackId: s.setCurrentTrackId,
    })),
  );
  const [section, setSection] = useState<Section>('mcq');

  const language = LANGUAGES.find((l) => l.id === currentTrackId) ?? LANGUAGES[0];
  const mcqTotal = getMcqQuestions(language.id).length;
  const exercises = (COURSES[language.id]?.modules ?? []).flatMap((m) => m.exercises);
  const codingSolved = exercises.filter((e) => user.solvedExercises[e.id]).length;
  const mcqBest = user.mcqResults?.[language.id]?.bestScore ?? 0;

  const mcqScore = {
    correct: Math.min(mcqBest, mcqTotal),
    total: mcqTotal,
    percent: mcqTotal ? Math.round((Math.min(mcqBest, mcqTotal) / mcqTotal) * 100) : 0,
  };
  const overall = overallPercent(mcqScore, codingSolved, exercises.length);

  const tabClass = (active: boolean) =>
    `flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      active ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Language tests</h1>
        <p className="text-sm text-slate-400 mt-1">Two sections per language: multiple choice, then coding.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setCurrentTrackId(l.id)}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium border transition-all ${
              l.id === language.id
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-900'
            }`}
          >
            <LanguageIcon id={l.id} className="w-4 h-4" colored />
            {l.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-[11px] font-mono text-slate-400">MCQs</p>
          <p className="text-lg font-bold text-white font-mono">
            {mcqScore.correct}/{mcqTotal}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-[11px] font-mono text-slate-400">Coding</p>
          <p className="text-lg font-bold text-white font-mono">
            {codingSolved}/{exercises.length}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="text-[11px] font-mono text-emerald-300">Overall</p>
          <p className="text-lg font-bold text-white font-mono">{overall}%</p>
          <p className="text-[10px] text-slate-400">{gradeLabel(overall)}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800" role="tablist">
        <button type="button" role="tab" aria-selected={section === 'mcq'} className={tabClass(section === 'mcq')} onClick={() => setSection('mcq')}>
          MCQs ({mcqTotal})
        </button>
        <button type="button" role="tab" aria-selected={section === 'coding'} className={tabClass(section === 'coding')} onClick={() => setSection('coding')}>
          Coding ({exercises.length})
        </button>
      </div>

      {section === 'mcq' ? (
        <McqSection key={language.id} language={language.id} onOpenCoding={() => setSection('coding')} />
      ) : (
        <CodingSection language={language.id} />
      )}
    </div>
  );
};
