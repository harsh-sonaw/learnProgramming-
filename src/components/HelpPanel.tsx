import React, { useState } from 'react';
import { Lightbulb, ListChecks, Stethoscope, Eye, BookOpen, Copy, Check } from 'lucide-react';
import { Exercise, RunResults } from '../types';
import { diagnose, LANGUAGE_TIPS } from '../utils/diagnose';

interface Props {
  exercise: Exercise;
  runResults: RunResults | null;
  failedRuns: number;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div>
    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

export const HelpPanel: React.FC<Props> = ({ exercise, runResults, failedRuns }) => {
  const [hintIdx, setHintIdx] = useState(-1);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);

  // reset when a different exercise opens
  const [forId, setForId] = useState(exercise.id);
  if (forId !== exercise.id) {
    setForId(exercise.id);
    setHintIdx(-1);
    setDone({});
    setShowSolution(false);
  }

  const failed = runResults ? runResults.results.filter(r => !r.passed) : [];
  const allHintsUsed = hintIdx >= exercise.hints.length - 1;
  const solutionUnlocked = failedRuns >= 2 || allHintsUsed;
  const tips = LANGUAGE_TIPS[exercise.trackId] || [];

  const copy = async () => {
    try { await navigator.clipboard.writeText(exercise.solutionCode); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <Section icon={<ListChecks className="w-3.5 h-3.5 text-emerald-400" />} title="Plan: tick off each step">
        <ol className="space-y-1.5">
          {exercise.instructions.map((step, i) => (
            <li key={i}>
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!done[i]}
                  onChange={() => setDone(d => ({ ...d, [i]: !d[i] }))}
                  className="mt-0.5 accent-emerald-500"
                />
                <span className={done[i] ? 'line-through text-slate-500' : ''}>{step}</span>
              </label>
            </li>
          ))}
        </ol>
      </Section>

      {failed.length > 0 && (
        <Section icon={<Stethoscope className="w-3.5 h-3.5 text-rose-400" />} title="Why did my tests fail?">
          <div className="space-y-2">
            {failed.slice(0, 3).map(r => (
              <div key={r.testId} className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs space-y-1">
                <p className="font-semibold text-rose-300">{r.description}</p>
                <p className="font-mono text-slate-400 break-all">got: {typeof r.actual === 'string' ? r.actual : JSON.stringify(r.actual)}</p>
                <p className="font-mono text-slate-400 break-all">expected: {JSON.stringify(r.expected)}</p>
                <p className="text-amber-200/90 font-sans">{diagnose(r)}</p>
              </div>
            ))}
            {failed.length > 3 && <p className="text-[11px] text-slate-500">Fix these first, then run again to see the rest.</p>}
          </div>
        </Section>
      )}

      <Section icon={<Lightbulb className="w-3.5 h-3.5 text-amber-400" />} title={`Hints (${Math.max(0, hintIdx + 1)}/${exercise.hints.length})`}>
        <div className="space-y-2">
          {exercise.hints.map((hint, idx) => (
            <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs">
              {hintIdx >= idx ? (
                <p className="text-amber-200/90 leading-relaxed font-sans">{hint}</p>
              ) : (
                <button
                  disabled={idx > hintIdx + 1}
                  onClick={() => setHintIdx(idx)}
                  className="text-amber-400 hover:text-amber-300 font-medium disabled:text-slate-600"
                >
                  Reveal hint #{idx + 1}
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {tips.length > 0 && (
        <Section icon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />} title="Quick syntax tips">
          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Section>
      )}

      <Section icon={<Eye className="w-3.5 h-3.5 text-violet-400" />} title="Still stuck?">
        {!solutionUnlocked ? (
          <p className="text-xs text-slate-500">The reference solution unlocks after 2 failed runs or after you open all hints. Failed runs so far: {failedRuns}.</p>
        ) : !showSolution ? (
          <button onClick={() => setShowSolution(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white">
            Show reference solution
          </button>
        ) : (
          <div className="rounded-lg border border-violet-500/30 bg-slate-950 p-3">
            <div className="flex justify-end mb-1">
              <button onClick={copy} className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto whitespace-pre">{exercise.solutionCode}</pre>
            <p className="text-[11px] text-slate-500 mt-2">Try to retype it from memory instead of pasting. You will learn more.</p>
          </div>
        )}
      </Section>
    </div>
  );
};
