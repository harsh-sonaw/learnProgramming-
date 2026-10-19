import { XP_REWARDS } from '../config/constants';
import type { McqQuestion, McqResult } from '../types';

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

/** Score a set of answers. `answers` maps question id -> chosen option index. */
export function scoreQuiz(
  questions: readonly McqQuestion[],
  answers: Readonly<Record<string, number>>,
): QuizScore {
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const total = questions.length;
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

/** XP for beating your best score: nothing for repeats, so retries can't be farmed. */
export function xpForQuizImprovement(previousBest: number, correct: number): number {
  return Math.max(0, correct - previousBest) * XP_REWARDS.mcqCorrect;
}

/** Merge a finished attempt into the stored result for a language. */
export function mergeQuizResult(
  previous: McqResult | undefined,
  score: QuizScore,
  now: Date = new Date(),
): McqResult {
  return {
    bestScore: Math.max(previous?.bestScore ?? 0, score.correct),
    total: score.total,
    attempts: (previous?.attempts ?? 0) + 1,
    lastAttemptAt: now.toISOString(),
  };
}

/** Overall test grade: MCQ and coding count equally. */
export function overallPercent(mcq: QuizScore, codingSolved: number, codingTotal: number): number {
  const mcqPart = mcq.total === 0 ? 0 : mcq.correct / mcq.total;
  const codingPart = codingTotal === 0 ? 0 : codingSolved / codingTotal;
  const parts = [mcq.total > 0 ? mcqPart : null, codingTotal > 0 ? codingPart : null].filter(
    (v): v is number => v !== null,
  );
  if (parts.length === 0) return 0;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}

/** Fisher-Yates shuffle (pure: returns a new array). `random` is injectable for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function gradeLabel(percent: number): string {
  if (percent >= 90) return 'Outstanding';
  if (percent >= 75) return 'Strong';
  if (percent >= 50) return 'Getting there';
  return 'Keep practising';
}
