import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { gradeLabel } from '@/core/quiz';
import { getMcqQuestions } from '@/data/mcq';
import { useAppStore } from '@/store';
import type { LanguageId } from '@/types';
import { useMcqQuiz } from './useMcqQuiz';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-amber-400',
  Advanced: 'text-rose-400',
};

interface McqSectionProps {
  language: LanguageId;
  onOpenCoding: () => void;
}

export const McqSection: React.FC<McqSectionProps> = ({ language, onOpenCoding }) => {
  const questions = getMcqQuestions(language);
  const best = useAppStore((s) => s.user.mcqResults?.[language]);
  const submitMcqResult = useAppStore((s) => s.submitMcqResult);
  const [xpGained, setXpGained] = useState(0);

  const quiz = useMcqQuiz(questions, (score) => setXpGained(submitMcqResult(language, score)));

  if (questions.length === 0) {
    return <p className="text-sm text-slate-400">No questions for this language yet.</p>;
  }

  // ---------- Intro ----------
  if (quiz.phase === 'intro') {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Multiple choice</h3>
        <p className="text-sm text-slate-300">
          {questions.length} questions, from beginner to advanced. You see the answer and an explanation after each one.
          Earn 5 XP for every point above your previous best.
        </p>
        {best && (
          <p className="text-sm font-mono text-emerald-300">
            Best: {best.bestScore}/{questions.length} · {best.attempts} attempt{best.attempts === 1 ? '' : 's'}
          </p>
        )}
        <button
          type="button"
          onClick={quiz.start}
          className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm active:scale-95 transition-all"
        >
          {best ? 'Try again' : 'Start the quiz'}
        </button>
      </div>
    );
  }

  // ---------- Results ----------
  if (quiz.phase === 'done') {
    const wrong = quiz.deck.filter((q) => quiz.answers[q.id] !== q.correctIndex);
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center space-y-2">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto" />
          <p className="text-3xl font-extrabold text-white font-mono">
            {quiz.score.correct}/{quiz.score.total}
          </p>
          <p className="text-sm text-slate-300">
            {quiz.score.percent}% · {gradeLabel(quiz.score.percent)}
          </p>
          <p className="text-xs font-mono text-emerald-300">
            {xpGained > 0 ? `+${xpGained} XP for beating your best score` : 'No new XP: beat your best score to earn more'}
          </p>
        </div>

        {wrong.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Review what you missed</h4>
            {wrong.map((q) => (
              <div key={q.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-sm">
                <p className="text-white font-medium">{q.question}</p>
                <p className="text-rose-300 flex gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Your answer: {q.options[quiz.answers[q.id]]}</span>
                </p>
                <p className="text-emerald-300 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Correct: {q.options[q.correctIndex]}</span>
                </p>
                <p className="text-slate-400">{q.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-emerald-300">Perfect score. Nothing to review.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={quiz.start}
            className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          <button
            type="button"
            onClick={onOpenCoding}
            className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
          >
            Continue to coding <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- Question ----------
  const q = quiz.current;
  const progress = Math.round(((quiz.index + (quiz.answered ? 1 : 0)) / quiz.deck.length) * 100);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:p-6 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Question {quiz.index + 1} of {quiz.deck.length}
          </span>
          <span className={DIFFICULTY_STYLE[q.difficulty]}>{q.difficulty}</span>
        </div>
        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{q.question}</h3>

      {q.code && (
        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs sm:text-sm text-emerald-300 font-mono overflow-x-auto">
          {q.code}
        </pre>
      )}

      <div className="space-y-2" role="radiogroup" aria-label="Answers">
        {q.options.map((option, i) => {
          const isChosen = quiz.selected === i;
          const isCorrect = i === q.correctIndex;
          let style = 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-600';
          if (quiz.answered) {
            if (isCorrect) style = 'border-emerald-500/70 bg-emerald-500/10 text-emerald-100';
            else if (isChosen) style = 'border-rose-500/70 bg-rose-500/10 text-rose-100';
            else style = 'border-slate-800 bg-slate-950/40 text-slate-500';
          }
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={quiz.answered}
              onClick={() => quiz.choose(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm flex gap-3 items-start transition-colors ${style}`}
            >
              <span className="font-mono font-bold text-xs mt-0.5 shrink-0">{LETTERS[i]}</span>
              <span className="min-w-0 break-words">{option}</span>
            </button>
          );
        })}
      </div>

      {quiz.answered && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-lg text-sm border ${
              quiz.selected === q.correctIndex
                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/5 text-rose-200'
            }`}
          >
            <p className="font-bold mb-1">{quiz.selected === q.correctIndex ? 'Correct' : 'Not quite'}</p>
            <p className="text-slate-300">{q.explanation}</p>
          </div>
          <button
            type="button"
            onClick={quiz.next}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
          >
            {quiz.isLast ? 'See results' : 'Next question'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
