import { useCallback, useMemo, useState } from 'react';
import { scoreQuiz, shuffle, type QuizScore } from '@/core/quiz';
import type { McqQuestion } from '@/types';

export type QuizPhase = 'intro' | 'running' | 'done';

/**
 * State machine for one MCQ attempt: intro -> questions (answer is locked once chosen)
 * -> results. `onComplete` fires once, when the last question is finished.
 */
export function useMcqQuiz(questions: readonly McqQuestion[], onComplete: (score: QuizScore) => void) {
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [deck, setDeck] = useState<McqQuestion[]>(() => [...questions]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = deck[index];
  const selected = current ? answers[current.id] : undefined;
  const answered = selected !== undefined;
  const score = useMemo(() => scoreQuiz(deck, answers), [deck, answers]);

  const start = useCallback(() => {
    setDeck(shuffle(questions));
    setAnswers({});
    setIndex(0);
    setPhase('running');
  }, [questions]);

  const choose = useCallback(
    (optionIndex: number) => {
      if (!current || answered) return;
      setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
    },
    [answered, current],
  );

  const next = useCallback(() => {
    if (!answered) return;
    if (index + 1 < deck.length) {
      setIndex(index + 1);
      return;
    }
    setPhase('done');
    onComplete(scoreQuiz(deck, answers));
  }, [answered, answers, deck, index, onComplete]);

  return {
    phase,
    deck,
    index,
    current,
    selected,
    answered,
    answers,
    score,
    isLast: index === deck.length - 1,
    start,
    choose,
    next,
  };
}
