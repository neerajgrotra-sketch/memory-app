import { useCallback, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEVELS, ROUND_SIZE, levelForRound } from '@/game/difficulty';
import { emptyAnswers, type Answers } from '@/game/quizNavigation';
import { selectQuestions, toRoundQuestion } from '@/game/selectQuestions';
import { EXTRA_SECONDS, useProfile } from '@/profile';
import { createStage, type Stage } from '@/scenes/createStage';
import { statsStore } from '@/stats';
import { layout } from '@/theme';
import type { Difficulty, Level, Question, RoundQuestion } from '@/types/game';
import type { RoundResult } from '@/types/stats';

export type Phase = 'memorise' | 'quiz' | 'result';

export interface Round {
  index: number;
  level: Level;
  viewSeconds: number;
  questions: RoundQuestion[];
}

function buildRound(
  difficulty: Difficulty,
  index: number,
  pool: Question[],
  seenIds: ReadonlySet<string>,
  previousIds: ReadonlySet<string>,
  extraSeconds = 0,
): Round {
  const level = levelForRound(difficulty, index);
  const picked = selectQuestions(pool, {
    count: ROUND_SIZE,
    preferredTypes: LEVELS[level].preferredTypes,
    seenIds,
    previousIds,
  });
  return { index, level, viewSeconds: LEVELS[level].viewSeconds + extraSeconds, questions: picked.map(toRoundQuestion) };
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function toRoundResult(
  sessionId: string,
  mode: Difficulty,
  stage: Stage,
  round: Round,
  answers: Answers,
  lookedSeconds: number,
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
    recipeId: stage.scene.recipeId,
    sceneId: stage.scene.id,
    score,
    total: round.questions.length,
    viewSeconds: round.viewSeconds,
    lookedSeconds,
    byType,
  };
}

/**
 * Runs one game for a difficulty. The first picture is built on first render;
 * remount (e.g. with `key={difficulty}`) to start over with another difficulty.
 */
export function useGameSession(difficulty: Difficulty) {
  // Pictures are laid out for the space below the countdown bar, down to the bottom safe-area inset.
  // (The picture measures itself too and lays the same contents out again if the space differs.)
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sceneWidth = Math.max(1, width - insets.left - insets.right);
  const sceneHeight = Math.max(1, height - insets.top - insets.bottom - layout.memoriseBarHeight);
  const size = useMemo(() => ({ width: sceneWidth, height: sceneHeight }), [sceneWidth, sceneHeight]);
  // "More time to look" (profile) adds a few seconds to every picture.
  const { profile } = useProfile();
  const extra = profile?.moreTime ? EXTRA_SECONDS : 0;
  // Temporary testing filter from the profile: only these settings.
  const recipeFilter = profile?.recipeFilter ?? null;
  const [first] = useState(() => {
    const firstStage = createStage(levelForRound(difficulty, 0), size, undefined, undefined, recipeFilter);
    return { stage: firstStage, round: buildRound(difficulty, 0, firstStage.questions, new Set(), new Set(), extra) };
  });
  const [stage, setStage] = useState<Stage>(first.stage);
  const [round, setRound] = useState<Round>(first.round);
  const [phase, setPhase] = useState<Phase>('memorise');
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(first.round.questions.length));

  /** Question ids already asked about the current picture. */
  const seenIds = useRef(new Set<string>());
  const roundCount = useRef(0);
  const sessionId = useRef(makeId());

  /** Builds a brand-new picture for round `index`, in a different setting from the last one. */
  const startStage = useCallback(
    (index: number, previousRecipeId?: string) => {
      const next = createStage(levelForRound(difficulty, index), size, previousRecipeId, undefined, recipeFilter);
      seenIds.current = new Set();
      setStage(next);
      const nextRound = buildRound(difficulty, index, next.questions, seenIds.current, new Set(), extra);
      setRound(nextRound);
      setAnswers(emptyAnswers(nextRound.questions.length));
      setPhase('memorise');
    },
    [size, difficulty, extra, recipeFilter],
  );

  /** How long the player looked at the current picture before answering. */
  const looked = useRef(0);
  const finishMemorising = useCallback((lookedSeconds: number) => {
    looked.current = lookedSeconds;
    setPhase('quiz');
  }, []);

  /** Records the answer to question `questionIndex` (questions can be answered in any order after skipping). */
  const answer = useCallback(
    (questionIndex: number, optionIndex: number) => {
      const next = answers.map((a, i) => (i === questionIndex ? optionIndex : a));
      setAnswers(next);
      if (next.every((a) => a !== null)) {
        setPhase('result');
        statsStore.addResult(toRoundResult(sessionId.current, difficulty, stage, round, next, looked.current)).catch(() => {});
      }
    },
    [answers, difficulty, round, stage],
  );

  /** Records the finished round and returns its question ids. */
  const finishRound = useCallback(() => {
    const ids = new Set(round.questions.map((question) => question.id));
    ids.forEach((id) => seenIds.current.add(id));
    roundCount.current = round.index + 1;
    return ids;
  }, [round]);

  const playAgain = useCallback(() => {
    const previousIds = finishRound();
    const nextRound = buildRound(difficulty, roundCount.current, stage.questions, seenIds.current, previousIds, extra);
    setRound(nextRound);
    setAnswers(emptyAnswers(nextRound.questions.length));
    setPhase('memorise');
  }, [difficulty, extra, finishRound, stage]);

  const nextPicture = useCallback(() => {
    finishRound();
    startStage(roundCount.current, stage.scene.recipeId);
  }, [finishRound, startStage, stage]);

  const score = answers.filter((choice, i) => choice === round.questions[i]?.answerIndex).length;

  return { stage, round, phase, answers, score, finishMemorising, answer, playAgain, nextPicture };
}
