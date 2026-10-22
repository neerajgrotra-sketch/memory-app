import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEVELS, ROUND_SIZE, type LevelConfig } from '@/game/difficulty';
import { emptyAnswers, type Answers } from '@/game/quizNavigation';
import { selectQuestions, toRoundQuestion } from '@/game/selectQuestions';
import {
  PRACTICE_LEVEL,
  applyRound,
  bandOf,
  knobsForLevel,
  recipesForLevel,
  type LadderState,
} from '@/games/lookRemember/ladder';
import { DAILY_MULTIPLIER, dailySeed, localDay } from '@/games/lookRemember/daily';
import { MAX_FIFTY, MAX_PEEKS, earnPeeks, fiftyHidden, peekSecondsFor, spendPeek, winPeeks, type PeekWallet } from '@/games/lookRemember/peeks';
import { SPEED_QUESTIONS, speedPrize, speedQuestions, type SpeedPrize, type SpeedQuestion } from '@/games/lookRemember/speed';
import { placesOff } from '@/games/lookRemember/places';
import { clearSavedRound, saveRound, slotFor, type SavedRound } from '@/games/lookRemember/savedRound';
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
  /** The questions peeked at (at most one, except with a tester's unlimited Peeks). */
  peeked: number[];
  /** The question a 50:50 was used on. */
  fiftied: number[];
}

/** A Super Speed Round's picture and questions (see games/lookRemember/speed). */
export interface SpeedRoundSetup {
  stage: Stage;
  questions: SpeedQuestion[];
  level: number;
  viewSeconds: number;
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
  previousTemplates?: ReadonlySet<string>,
): Round {
  const picked = selectQuestions(pool, {
    count: ROUND_SIZE,
    preferredTypes: setup.knobs.preferredTypes,
    typeCaps: setup.knobs.typeCaps,
    seenIds,
    previousIds,
    previousTemplates,
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
  /** 50:50s held when the session starts. */
  fifty?: number;
  /** A round saved part way through (see `SavedRound`): the session starts at its next unanswered question. */
  resume?: SavedRound;
}

/**
 * Runs one session of Look & Remember. The first picture is built on first render;
 * remount (e.g. with a `key`) to start over in another mode.
 */
export function useGameSession({ mode, ladder: startLadder, highScore: startHighScore, peeks: startPeeks, fifty: startFifty = 0, resume }: SessionStart) {
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
  // Tester mode can make Peeks unlimited: the count stays full and real Peeks aren't spent.
  const unlimitedPeeks = tester && profile?.testPeeks === true;

  const [ladder, setLadder] = useState<LadderState>(startLadder);
  const highScore = useRef(startHighScore);

  const [first] = useState(() => {
    if (resume) return { stage: resume.stage, round: resume.round };
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
  // A resumed round goes straight to its questions, never the picture again.
  const [phase, setPhase] = useState<Phase>(resume ? 'quiz' : 'memorise');
  const [answers, setAnswers] = useState<Answers>(() => resume?.answers ?? emptyAnswers(first.round.questions.length));
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  // A Peek is only recorded when its round ends, so one used before the round was closed is spent again here.
  const [wallet, setWallet] = useState<PeekWallet>(() => (resume?.peeked.length && !unlimitedPeeks ? spendPeek(startPeeks) : startPeeks));
  /** The questions peeked at this round (one peek per round, except with a tester's unlimited Peeks). */
  const [peeked, setPeeked] = useState<number[]>(resume?.peeked ?? []);
  // 50:50s, spent like Peeks: one per round, recorded when the round ends.
  const [fiftyLeft, setFiftyLeft] = useState(() => Math.max(0, startFifty - (resume?.fiftied?.length ? 1 : 0)));
  /** The question a 50:50 was used on this round, if any. */
  const [fiftied, setFiftied] = useState<number[]>(resume?.fiftied ?? []);

  /** Question ids already asked about the current picture. */
  const seenIds = useRef(new Set<string>(resume?.seenIds ?? []));
  const roundCount = useRef(resume?.round.index ?? 0);
  /** The wordings of the last round finished, which the next round avoids where it can. */
  const lastTemplates = useRef(new Set<string>());
  const sessionId = useRef(resume?.sessionId ?? makeId());
  /** Levels rounds this session that count (no replays): the Super Speed Round comes every few of them. */
  const [levelsRounds, setLevelsRounds] = useState(0);

  /** Builds a brand-new picture for round `index`, in a different setting from the last one. */
  const startStage = useCallback(
    (index: number, ladderLevel: number, previousRecipeId?: string) => {
      const setup = setupFor(mode, ladderLevel);
      const next = createStage(setup.knobs, size, previousRecipeId, undefined, { unlocked: tester ? undefined : setup.unlocked, off });
      seenIds.current = new Set();
      setStage(next);
      const nextRound = buildRound(setup, index, next.questions, seenIds.current, new Set(), extra, false, lastTemplates.current);
      setRound(nextRound);
      setAnswers(emptyAnswers(nextRound.questions.length));
      setOutcome(null);
      setPeeked([]);
      setFiftied([]);
      setPhase('memorise');
    },
    [size, mode, extra, off, tester],
  );

  /** How long the player looked at the current picture before answering (all of it, for a Daily closed while looking). */
  const looked = useRef(resume ? (resume.phase === 'memorise' ? resume.round.viewSeconds : resume.looked) : 0);
  const finishMemorising = useCallback((lookedSeconds: number) => {
    looked.current = lookedSeconds;
    setPhase('quiz');
  }, []);

  /** Scores the round, moves the level, and saves it. */
  const finish = useCallback(
    (final: Answers) => {
      const correct = round.questions.map((q, i) => final[i] === q.answerIndex);
      const score = correct.filter(Boolean).length;
      const base = pointsFor({ correct, level: round.level, viewSeconds: round.viewSeconds, lookedSeconds: looked.current, peeked: [...peeked, ...fiftied] });
      // The Daily Challenge is worth double.
      const points = mode === 'daily' ? { ...base, daily: base.total * (DAILY_MULTIPLIER - 1), total: base.total * DAILY_MULTIPLIER } : base;
      // Seeing a picture twice makes it easier, so a replay never counts towards your level or high score;
      // nor does the Daily Challenge, whose points are doubled.
      const counts = !round.replay && mode !== 'daily';
      const newHighScore = counts && highScore.current > 0 && points.total > highScore.current;
      if (counts) highScore.current = Math.max(highScore.current, points.total);
      // A peek's only cost is half points for that answer: the round counts towards your level as usual.
      // (Costing both points and progress felt like being punished twice for a Peek you'd earned.)
      const total = round.questions.length;
      const after = mode === 'levels' && counts ? applyRound(ladder, score, total) : undefined;
      const earned = earnPeeks(wallet, points.total);
      setWallet(earned.wallet);
      if (after) {
        setLadder(after);
        setLevelsRounds((n) => n + 1);
      }
      setOutcome({
        points,
        newHighScore,
        highScore: highScore.current,
        replay: round.replay,
        ladder: after ? { before: ladder, after } : undefined,
        peeksEarned: earned.earned,
        peeked,
        fiftied,
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
        // A tester's unlimited peek isn't recorded, so it never comes off the real Peeks.
        peeked: (peeked.length > 0 && !unlimitedPeeks) || undefined,
        peekSeconds: peeked.length > 0 ? peekSecondsFor(profile) : undefined,
        fifty: fiftied.length > 0 || undefined,
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
    [ladder, mode, round, stage, peeked, fiftied, wallet, unlimitedPeeks, profile],
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
    lastTemplates.current = new Set(round.questions.flatMap((question) => (question.template ? [question.template] : [])));
    roundCount.current = round.index + 1;
    return ids;
  }, [round]);

  /** Same picture, other questions, as practice: it never moves your level or sets a high score. */
  const playAgain = useCallback(() => {
    const previousIds = finishRound();
    // Keeps the settings the picture was made with (your level may have changed since).
    const setup = mode === 'levels' ? setupFor(mode, round.level) : setupFor(mode, ladder.level);
    const nextRound = buildRound(setup, roundCount.current, stage.questions, seenIds.current, previousIds, extra, true, lastTemplates.current);
    setRound(nextRound);
    setAnswers(emptyAnswers(nextRound.questions.length));
    setOutcome(null);
    setPeeked([]);
    setFiftied([]);
    setPhase('memorise');
  }, [extra, finishRound, ladder.level, mode, round.level, stage]);

  const nextPicture = useCallback(() => {
    finishRound();
    startStage(roundCount.current, ladder.level, stage.scene.recipeId);
  }, [finishRound, ladder.level, startStage, stage]);

  /** One peek per round (any number with a tester's unlimited Peeks), while answering, never in the Daily Challenge. */
  const canPeek = phase === 'quiz' && mode !== 'daily' && (unlimitedPeeks || (wallet.peeks > 0 && peeked.length === 0));
  /** Uses a Peek on question `questionIndex`. */
  const peek = useCallback(
    (questionIndex: number) => {
      if (!canPeek) return;
      setPeeked((was) => (was.includes(questionIndex) ? was : [...was, questionIndex]));
      if (!unlimitedPeeks) setWallet(spendPeek);
    },
    [canPeek, unlimitedPeeks],
  );

  /** One 50:50 per round, on a question with three or more options, never in the Daily Challenge. */
  const canFifty = phase === 'quiz' && mode !== 'daily' && fiftyLeft > 0 && fiftied.length === 0;
  const applyFifty = useCallback(
    (questionIndex: number) => {
      const q = round.questions[questionIndex];
      if (!canFifty || !q || !fiftyHidden(q).length) return;
      setFiftied([questionIndex]);
      setFiftyLeft((n) => Math.max(0, n - 1));
    },
    [canFifty, round],
  );

  /**
   * Scores and saves a Super Speed Round, and hands over its prizes. It never moves your level or sets a high score; its
   * points count towards Peeks as usual.
   */
  const finishSpeed = useCallback(
    (setup: SpeedRoundSetup, right: number, lookedSeconds: number): SpeedPrize & { resultId: string } => {
      const prize = speedPrize(right, setup.level, { peeks: wallet.peeks >= MAX_PEEKS, fifty: fiftyLeft >= MAX_FIFTY });
      setWallet((w) => winPeeks(earnPeeks(w, prize.points).wallet, prize.peeks));
      setFiftyLeft((n) => Math.min(MAX_FIFTY, n + prize.fifty));
      const result: RoundResult = {
        id: makeId(),
        sessionId: sessionId.current,
        gameId: 'look-remember',
        playedAt: new Date().toISOString(),
        mode: 'levels',
        level: bandOf(setup.level),
        speed: true,
        points: prize.points,
        bonus: prize.peeks || prize.fifty ? { peeks: prize.peeks || undefined, fifty: prize.fifty || undefined } : undefined,
        recipeId: setup.stage.scene.recipeId,
        sceneId: setup.stage.scene.id,
        score: right,
        total: SPEED_QUESTIONS,
        viewSeconds: setup.viewSeconds,
        lookedSeconds,
        byType: {},
      };
      statsStore.addResult(result).catch(() => {});
      return { ...prize, resultId: result.id };
    },
    [fiftyLeft, wallet.peeks],
  );

  /** A speed round turned down ("Not now"): saved with no score, so the count to the next one starts again. Returns its id. */
  const skipSpeed = useCallback((setup: SpeedRoundSetup): string => {
    const result: RoundResult = {
      id: makeId(),
      sessionId: sessionId.current,
      gameId: 'look-remember',
      playedAt: new Date().toISOString(),
      mode: 'levels',
      level: bandOf(setup.level),
      speed: true,
      skipped: true,
      points: 0,
      recipeId: setup.stage.scene.recipeId,
      sceneId: setup.stage.scene.id,
      score: 0,
      total: 0,
      byType: {},
    };
    statsStore.addResult(result).catch(() => {});
    return result.id;
  }, []);

  /**
   * A Super Speed Round's own picture, at your level, in another place from the one just played. Tries a few pictures
   * for one with eight quick questions; null if none had (a rare, small picture), and the round is skipped.
   */
  const makeSpeedRound = useCallback((): SpeedRoundSetup | null => {
    const setup = setupFor('levels', ladder.level);
    for (let attempt = 0; attempt < 4; attempt++) {
      const next = createStage(setup.knobs, size, stage.scene.recipeId, undefined, { unlocked: tester ? undefined : setup.unlocked, off });
      const questions = speedQuestions(next.questions, next.scene.seed);
      if (questions.length === 8) return { stage: next, questions, level: ladder.level, viewSeconds: setup.knobs.viewSeconds + extra };
    }
    return null;
  }, [extra, ladder.level, off, size, stage, tester]);

  // Keeps the round in progress saved, so it can be resumed after the app is closed (see `SavedRound`): the
  // questions after every answer, and the Daily Challenge from the moment its picture shows. A finished round,
  // or a Levels picture still being looked at, leaves nothing to resume.
  useEffect(() => {
    if (phase === 'result' || (phase === 'memorise' && mode !== 'daily')) {
      clearSavedRound(slotFor(mode));
      return;
    }
    saveRound({
      mode,
      savedAt: new Date().toISOString(),
      day: localDay(),
      phase,
      stage,
      round,
      answers,
      peeked,
      fiftied,
      looked: looked.current,
      sessionId: sessionId.current,
      seenIds: [...seenIds.current],
    });
  }, [mode, phase, stage, round, answers, peeked, fiftied]);

  const score = answers.filter((choice, i) => choice === round.questions[i]?.answerIndex).length;

  // What the Peek button shows: a full count for a tester's unlimited Peeks.
  const peeksLeft = unlimitedPeeks ? MAX_PEEKS : wallet.peeks;

  return {
    stage,
    round,
    phase,
    answers,
    score,
    outcome,
    ladder,
    wallet,
    peeksLeft,
    peeked,
    canPeek,
    unlimitedPeeks,
    peek,
    levelsRounds,
    fiftyLeft,
    fiftied,
    applyFifty,
    finishSpeed,
    skipSpeed,
    makeSpeedRound,
    finishMemorising,
    answer,
    playAgain,
    nextPicture,
  };
}
