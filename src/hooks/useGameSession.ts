import { useCallback, useEffect, useRef, useState } from 'react';

import { repository } from '@/data';
import { LEVELS, ROUND_SIZE, levelForRound } from '@/game/difficulty';
import { selectQuestions, shuffle, toRoundQuestion } from '@/game/selectQuestions';
import { statsStore } from '@/stats';
import type { Difficulty, GameImage, Question, RoundQuestion } from '@/types/game';
import type { RoundResult } from '@/types/stats';

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

/** Shuffled play order for the pictures; reshuffled when used up, never repeating back to back. */
function nextDeck(images: GameImage[], currentId?: string): GameImage[] {
  const deck = shuffle(images);
  if (deck.length > 1 && deck[0].id === currentId) deck.push(deck.shift()!);
  return deck;
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function toRoundResult(
  sessionId: string,
  mode: Difficulty,
  image: GameImage,
  round: Round,
  answers: number[],
): RoundResult {
  const byType: RoundResult['byType'] = {};
  let score = 0;
  round.questions.forEach((question, i) => {
    const correct = answers[i] === question.answerIndex;
    const tally = (byType[question.type] ??= { correct: 0, total: 0 });
    tally.total += 1;
    if (correct) {
      tally.correct += 1;
      score += 1;
    }
  });
  return {
    id: makeId(),
    sessionId,
    playedAt: new Date().toISOString(),
    mode,
    level: round.level,
    imageId: image.id,
    score,
    total: round.questions.length,
    byType,
  };
}

function seenIn(seenByImage: Map<string, Set<string>>, imageId: string): Set<string> {
  let seen = seenByImage.get(imageId);
  if (!seen) seenByImage.set(imageId, (seen = new Set()));
  return seen;
}

export function useGameSession(difficulty: Difficulty) {
  const [image, setImage] = useState<GameImage | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>('memorise');
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMorePictures, setHasMorePictures] = useState(false);

  const deck = useRef<GameImage[]>([]);
  const allImages = useRef<GameImage[]>([]);
  /** Question ids already asked, per picture, for the whole session. */
  const seenByImage = useRef(new Map<string, Set<string>>());
  const roundCount = useRef(0);
  const sessionId = useRef(makeId());

  /** Loads the next picture from the deck and starts a round on it. */
  const startNextPicture = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      if (deck.current.length === 0) deck.current = nextDeck(allImages.current, image?.id);
      const picked = deck.current.shift()!;

      setRound(null);
      const questions = await repository.getQuestions(picked.id);
      if (questions.length < ROUND_SIZE) throw new Error(`"${picked.title}" does not have enough questions yet.`);
      if (isCancelled()) return;

      setImage(picked);
      setPool(questions);
      setRound(buildRound(difficulty, roundCount.current, questions, seenIn(seenByImage.current, picked.id), new Set()));
      setAnswers([]);
      setPhase('memorise');
    },
    [difficulty, image?.id],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const images = await repository.listImages();
        if (images.length === 0) throw new Error('No pictures are available yet.');
        if (cancelled) return;

        allImages.current = images;
        deck.current = nextDeck(images);
        seenByImage.current = new Map();
        roundCount.current = 0;
        sessionId.current = makeId();
        setHasMorePictures(images.length > 1);
        await startNextPicture(() => cancelled);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    })();

    return () => {
      cancelled = true;
    };
    // Restart only when the difficulty changes, not when the current picture does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const finishMemorising = useCallback(() => setPhase('quiz'), []);

  const answer = useCallback(
    (optionIndex: number) => {
      if (!round || !image) return;
      const next = [...answers, optionIndex];
      setAnswers(next);
      if (next.length >= round.questions.length) {
        setPhase('result');
        statsStore.addResult(toRoundResult(sessionId.current, difficulty, image, round, next)).catch(() => {});
      }
    },
    [answers, difficulty, image, round],
  );

  /** Records the finished round and returns its question ids. */
  const finishRound = useCallback(() => {
    if (!round || !image) return new Set<string>();
    const ids = new Set(round.questions.map((question) => question.id));
    ids.forEach((id) => seenIn(seenByImage.current, image.id).add(id));
    roundCount.current = round.index + 1;
    return ids;
  }, [image, round]);

  const playAgain = useCallback(() => {
    if (!image) return;
    const previousIds = finishRound();
    setRound(buildRound(difficulty, roundCount.current, pool, seenIn(seenByImage.current, image.id), previousIds));
    setAnswers([]);
    setPhase('memorise');
  }, [difficulty, finishRound, image, pool]);

  const nextPicture = useCallback(() => {
    finishRound();
    startNextPicture().catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong.'));
  }, [finishRound, startNextPicture]);

  const score = round
    ? answers.filter((choice, i) => choice === round.questions[i]?.answerIndex).length
    : 0;

  return {
    image,
    round,
    phase,
    answers,
    score,
    error,
    hasMorePictures,
    finishMemorising,
    answer,
    playAgain,
    nextPicture,
  };
}
