import { useCallback, useEffect, useRef, useState } from 'react';

import { repository } from '@/data';
import { LEVELS, ROUND_SIZE, levelForRound } from '@/game/difficulty';
import { selectQuestions, toRoundQuestion } from '@/game/selectQuestions';
import type { Difficulty, GameImage, Question, RoundQuestion } from '@/types/game';

export type Phase = 'memorise' | 'quiz' | 'result';

export interface Round {
  index: number;
  level: ReturnType<typeof levelForRound>;
  questions: RoundQuestion[];
}

function buildRound(
  difficulty: Difficulty,
  index: number,
  pool: Question[],
  seenIds: ReadonlySet<string>,
  previousIds: ReadonlySet<string>,
): Round {
  const level = levelForRound(difficulty, index);
  const picked = selectQuestions(pool, {
    count: ROUND_SIZE,
    preferredTypes: LEVELS[level].preferredTypes,
    seenIds,
    previousIds,
  });
  return { index, level, questions: picked.map(toRoundQuestion) };
}

export function useGameSession(difficulty: Difficulty) {
  const [image, setImage] = useState<GameImage | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>('memorise');
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const images = await repository.listImages();
        if (images.length === 0) throw new Error('No pictures are available yet.');
        const picked = images[Math.floor(Math.random() * images.length)];
        const questions = await repository.getQuestions(picked.id);
        if (questions.length < ROUND_SIZE) throw new Error('This picture does not have enough questions yet.');
        if (cancelled) return;

        seenIds.current = new Set();
        setImage(picked);
        setPool(questions);
        setRound(buildRound(difficulty, 0, questions, seenIds.current, new Set()));
        setAnswers([]);
        setPhase('memorise');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [difficulty]);

  const finishMemorising = useCallback(() => setPhase('quiz'), []);

  const answer = useCallback(
    (optionIndex: number) => {
      if (!round) return;
      const next = [...answers, optionIndex];
      setAnswers(next);
      if (next.length >= round.questions.length) setPhase('result');
    },
    [answers, round],
  );

  const playAgain = useCallback(() => {
    if (!round) return;
    const previousIds = new Set(round.questions.map((question) => question.id));
    previousIds.forEach((id) => seenIds.current.add(id));
    setRound(buildRound(difficulty, round.index + 1, pool, seenIds.current, previousIds));
    setAnswers([]);
    setPhase('memorise');
  }, [difficulty, pool, round]);

  const score = round
    ? answers.filter((choice, i) => choice === round.questions[i]?.answerIndex).length
    : 0;

  return { image, round, phase, answers, score, error, finishMemorising, answer, playAgain };
}
