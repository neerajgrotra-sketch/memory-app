import { useCallback, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEVELS, ROUND_SIZE, type LevelConfig } from '@/game/difficulty';
import { emptyAnswers, type Answers } from '@/game/quizNavigation';
import { selectQuestions, toRoundQuestion } from '@/game/selectQuestions';
import {
  PRACTICE_LEVEL,
  applyRound,
  bandOf,
  isGoodRound,
  knobsForLevel,
  recipesForLevel,
  type LadderState,
} from '@/games/lookRemember/ladder';
import { DAILY_MULTIPLIER, dailySeed, localDay } from '@/games/lookRemember/daily';
import { earnPeeks, spendPeek, type PeekWallet } from '@/games/lookRemember/peeks';
import { placesOff } from '@/games/lookRemember/places';
import { pointsFor, type PointsBreakdown } from '@/games/lookRemember/points';
import { EXTRA_SECONDS, useProfile } from '@/profile';
import { createStage, type Stage } from '@/scenes/createStage';
import { statsStore } from '@/stats';
import { layout } from '@/theme';
import type { Level, PlayMode, Question, RoundQuestion } from '@/types/game';
import type { RoundResult } from '@/types/stats';

export type Phase = 'memorise' | 'quiz' | 'result';

export interface Round {
  index: number;
  /** The band (for charts and the practice table). */
  band: Level;
  /** The level played: your level, or the level a Practice band plays like (for points). */
  level: number;
  viewSeconds: number;
  questions: RoundQuestion[];
  /** The same picture again: practice that never moves your level or sets a high score. */
  replay: boolean;
}

/** What happened in the round just finished, for the result screen. */
export interface RoundOutcome {
  points: PointsBreakdown;
  /** Beat the previous high score (never on the very first round with points). */
  newHighScore: boolean;
  highScore: number;
  /** Same picture again (see Round.replay). */
  replay: boolean;
  /** Levels only, and never for a replay: before and after this round. */
  ladder?: { before: LadderState; after: LadderState };
  /** Peeks this round's points earned. */
  peeksEarned: number;
  /** The question peeked at, if any. */
  peeked: number | null;
}

interface Setup {
  band: Level;
  level: number;
  knobs: LevelConfig;
  /** Settings this round may use (levels only). */
  unlocked?: string[];
}

function setupFor(mode: PlayMode, ladderLevel: number): Setup {
  // The Daily Challenge is played at your level, from the places you've reached.
  if (mode === 'levels' || mode === 'daily') {
    return { band: bandOf(ladderLevel), level: ladderLevel, knobs: knobsForLevel(ladderLevel), unlocked: recipesForLevel(ladderLevel) };
  }
  return { band: mode, level: PRACTICE_LEVEL[mode], knobs: LEVELS[mode] };
}

function buildRound(
  setup: Setup,
  index: number,
  pool: Question[],
  seenIds: ReadonlySet<string>,
  previousIds: ReadonlySet<string>,
  extraSeconds = 0,
  replay = false,
): Round {
  const picked = selectQuestions(pool, {
    count: ROUND_SIZE,
    preferredTypes: setup.knobs.preferredTypes,
    seenIds,
    previousIds,
  });
  return {
    index,
    band: setup.band,
    level: setup.level,
    viewSeconds: setup.knobs.viewSeconds + extraSeconds,
    questions: picked.map(toRoundQuestion),
    replay,
  };
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function byTypeOf(round: Round, answers: Answers) {
  const byType: RoundResult['byType'] = {};
  round.questions.forEach((question, i) => {
    const tally = (byType[question.type] ??= { correct: 0, total: 0 });
    tally.total += 1;
    if (answers[i] === question.answerIndex) tally.correct += 1;
  });
  return byType;
}

export interface SessionStart {
  mode: PlayMode;
  /** Your level when the session starts (levels mode). */
  ladder: LadderState;
  /** The best points so far, for "New high score". */
  highScore: number;
  /** Peeks held when the session starts. */
  peeks: PeekWallet;
}

/**
 * Runs one session of Look & Remember. The first picture is built on first render;
 * remount (e.g. with a `key`) to start over in another mode.
 */
export function useGameSession({ mode, ladder: startLadder, highScore: startHighScore, peeks: startPeeks }: SessionStart) {
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
  // My Places: settings the player switched off.
  const off = useMemo(() => placesOff(profile), [profile]);
  // Tester mode: every place counts as unlocked.
  const tester = profile?.tester === true;

  const [ladder, setLadder] = useState<LadderState>(startLadder);
  const highScore = useRef(startHighScore);

  const [first] = useState(() => {
    const setup = setupFor(mode, startLadder.level);
    // The Daily Challenge: the day's picture (same seed all day), from every place you've reached.
    const daily = mode === 'daily';
    const firstStage = createStage(setup.knobs, size, undefined, daily ? dailySeed(localDay()) : undefined, {
      unlocked: tester ? undefined : setup.unlocked,
      off: daily ? [] : off,
    });
    return { stage: firstStage, round: buildRound(setup, 0, firstStage.questions, new Set(), new Set(), extra) };
  });
  const [stage, setStage] = useState<Stage>(first.stage);
  const [round, setRound] = useState<Round>(first.round);
  const [phase, setPhase] = useState<Phase>('memorise');
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(first.round.questions.length));
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const [wallet, setWallet] = useState<PeekWallet>(startPeeks);
  /** The question peeked at this round (one peek per round). */
  const [peeked, setPeeked] = useState<number | null>(null);

  /** Question ids already asked about the current picture. */
  const seenIds = useRef(new Set<string>());
  const roundCount = useRef(0);
  const sessionId = useRef(makeId());

  /** Builds a brand-new picture for round `index`, in a different setting from the last one. */
  const startStage = useCallback(
    (index: number, ladderLevel: number, previousRecipeId?: string) => {
      const setup = setupFor(mode, ladderLevel);
      const next = createStage(setup.knobs, size, previousRecipeId, undefined, { unlocked: tester ? undefined : setup.unlocked, off });
      seenIds.current = new Set();
      setStage(next);
      const nextRound = buildRound(setup, index, next.questions, seenIds.current, new Set(), extra);
      setRound(nextRound);
      setAnswers(emptyAnswers(nextRound.questions.length));
      setOutcome(null);
      setPeeked(null);
      setPhase('memorise');
    },
    [size, mode, extra, off, tester],
  );

  /** How long the player looked at the current picture before answering. */
  const looked = useRef(0);
  const finishMemorising = useCallback((lookedSeconds: number) => {
    looked.current = lookedSeconds;
    setPhase('quiz');
  }, []);

  /** Scores the round, moves the level, and saves it. */
  const finish = useCallback(
    (final: Answers) => {
      const correct = round.questions.map((q, i) => final[i] === q.answerIndex);
      const score = correct.filter(Boolean).length;
      const peekedIndex = peeked ?? undefined;
      const base = pointsFor({ correct, level: round.level, viewSeconds: round.viewSeconds, lookedSeconds: looked.current, peeked: peekedIndex });
      // The Daily Challenge is worth double.
      const points = mode === 'daily' ? { ...base, daily: base.total * (DAILY_MULTIPLIER - 1), total: base.total * DAILY_MULTIPLIER } : base;
      // Seeing a picture twice makes it easier, so a replay never counts towards your level or high score;
      // nor does the Daily Challenge, whose points are doubled.
      const counts = !round.replay && mode !== 'daily';
      const newHighScore = counts && highScore.current > 0 && points.total > highScore.current;
      if (counts) highScore.current = Math.max(highScore.current, points.total);
      // A peeked answer never tips a round into a good one: peeks can't carry you up a level.
      const total = round.questions.length;
      const peekedRight = peekedIndex !== undefined && correct[peekedIndex];
      const levelScore = peekedRight && isGoodRound(score, total) ? score - 1 : score;
      const after = mode === 'levels' && counts ? applyRound(ladder, levelScore, total) : undefined;
      const earned = earnPeeks(wallet, points.total);
      setWallet(earned.wallet);
      if (after) setLadder(after);
      setOutcome({
        points,
        newHighScore,
        highScore: highScore.current,
        replay: round.replay,
        ladder: after ? { before: ladder, after } : undefined,
        peeksEarned: earned.earned,
        peeked,
      });
      const result: RoundResult = {
        id: makeId(),
        sessionId: sessionId.current,
        gameId: 'look-remember',
        playedAt: new Date().toISOString(),
        mode,
        level: round.band,
        ladder: after ? { level: round.level, after } : undefined,
        points: points.total,
        replay: round.replay || undefined,
        peeked: peeked !== null || undefined,
        recipeId: stage.scene.recipeId,
        sceneId: stage.scene.id,
        score,
        total: round.questions.length,
        viewSeconds: round.viewSeconds,
        lookedSeconds: looked.current,
        byType: byTypeOf(round, final),
      };
      statsStore.addResult(result).catch(() => {});
    },
    [ladder, mode, round, stage, peeked, wallet],
  );

  /** Records the answer to question `questionIndex` (questions can be answered in any order after skipping). */
  const answer = useCallback(
    (questionIndex: number, optionIndex: number) => {
      const next = answers.map((a, i) => (i === questionIndex ? optionIndex : a));
      setAnswers(next);
      if (next.every((a) => a !== null)) {
        finish(next);
        setPhase('result');
      }
    },
    [answers, finish],
  );

  /** Records the finished round and returns its question ids. */
  const finishRound = useCallback(() => {
    const ids = new Set(round.questions.map((question) => question.id));
    ids.forEach((id) => seenIds.current.add(id));
    roundCount.current = round.index + 1;
    return ids;
  }, [round]);

  /** Same picture, other questions, as practice: it never moves your level or sets a high score. */
  const playAgain = useCallback(() => {
    const previousIds = finishRound();
    // Keeps the settings the picture was made with (your level may have changed since).
    const setup = mode === 'levels' ? setupFor(mode, round.level) : setupFor(mode, ladder.level);
    const nextRound = buildRound(setup, roundCount.current, stage.questions, seenIds.current, previousIds, extra, true);
    setRound(nextRound);
    setAnswers(emptyAnswers(nextRound.questions.length));
    setOutcome(null);
    setPeeked(null);
    setPhase('memorise');
  }, [extra, finishRound, ladder.level, mode, round.level, stage]);

  const nextPicture = useCallback(() => {
    finishRound();
    startStage(roundCount.current, ladder.level, stage.scene.recipeId);
  }, [finishRound, ladder.level, startStage, stage]);

  /** One peek per round, while answering, never in the Daily Challenge. */
  const canPeek = phase === 'quiz' && mode !== 'daily' && wallet.peeks > 0 && peeked === null;
  /** Uses a Peek on question `questionIndex`. */
  const peek = useCallback(
    (questionIndex: number) => {
      if (!canPeek) return;
      setPeeked(questionIndex);
      setWallet(spendPeek);
    },
    [canPeek],
  );

  const score = answers.filter((choice, i) => choice === round.questions[i]?.answerIndex).length;

  return { stage, round, phase, answers, score, outcome, ladder, wallet, peeked, canPeek, peek, finishMemorising, answer, playAgain, nextPicture };
}
