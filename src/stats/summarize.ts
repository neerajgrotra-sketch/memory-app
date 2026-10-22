import { LEVEL_ORDER } from '@/game/difficulty';
import type { Difficulty, Level, PlayMode, QuestionType } from '@/types/game';
import type { RoundResult } from '@/types/stats';
import { localDay, streakOf } from '@/games/lookRemember/daily';

const TREND_WINDOW = 5;
/** Change in average score (out of 5) that counts as a real move up or down. */
const TREND_THRESHOLD = 0.3;

export type TrendDirection = 'up' | 'down' | 'steady';

export interface Trend {
  direction: TrendDirection;
  recentAverage: number;
  previousAverage: number;
  /** How many rounds each side of the comparison covers. */
  window: number;
}

export interface LevelSummary {
  level: Level;
  rounds: number;
  average: number;
  best: number;
  trend: Trend | null;
}

export interface TypeSummary {
  type: QuestionType;
  correct: number;
  total: number;
  accuracy: number;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  mode: PlayMode | Difficulty;
  /** Levelled sessions: the level the first round was played at, and your level after the last. */
  levelFrom?: number;
  levelTo?: number;
  /** Points scored over the session (rounds from before points count as 0). */
  points: number;
  rounds: number;
  correct: number;
  total: number;
  average: number;
}

/** How one question type is going: the latest rounds against the ones before. */
export interface TypeChange {
  type: QuestionType;
  before: number;
  after: number;
}

/** Practice habits and personal trends, always compared with the player's own earlier rounds. */
export interface PracticeSummary {
  daysPlayed: number;
  /** Days in a row with at least one round, ending today (or yesterday, if not played yet today). */
  streak: number;
  /** The longest run of days in a row. */
  bestStreak: number;
  /** How much scores vary over the last rounds (standard deviation, out of 5); null until enough rounds. */
  spread: number | null;
  typeChanges: TypeChange[];
  /**
   * Seconds left on the clock when you started answering, on average: your last rounds and the ones
   * before (null until there are enough rounds that recorded it).
   */
  earlyFinish: { recent: number; before: number | null } | null;
}

/** How you did at one level, or in one Practice band. */
export interface PlayedLevel {
  key: string;
  /** Set for levelled play; missing for a Practice band. */
  level?: number;
  band?: Level;
  rounds: number;
  /** Average right answers out of 5. */
  average: number;
  bestPoints: number;
}

export interface StatsSummary {
  rounds: number;
  sessions: number;
  average: number;
  perfectRounds: number;
  trend: Trend | null;
  levels: LevelSummary[];
  types: TypeSummary[];
  /** Most recent first. */
  recentSessions: SessionSummary[];
  /** Every level played, highest first, then each Practice band (same-picture replays are left out). */
  playedLevels: PlayedLevel[];
  /** Oldest first, for the chart. */
  recentRounds: RoundResult[];
  practice: PracticeSummary;
}

const QUESTION_TYPES: QuestionType[] = ['object', 'count', 'colour', 'position', 'number'];

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

/** Compares the latest rounds with the ones just before. Needs at least 4 rounds. */
export function trendOf(results: RoundResult[]): Trend | null {
  const window = Math.min(TREND_WINDOW, Math.floor(results.length / 2));
  if (window < 2) return null;
  const recentAverage = average(results.slice(-window).map((r) => r.score));
  const previousAverage = average(results.slice(-2 * window, -window).map((r) => r.score));
  const delta = recentAverage - previousAverage;
  const direction = delta >= TREND_THRESHOLD ? 'up' : delta <= -TREND_THRESHOLD ? 'down' : 'steady';
  return { direction, recentAverage, previousAverage, window };
}

/** Rounds compared on each side of a type change, and the least questions per side to say anything. */
const CHANGE_WINDOW = 10;
const CHANGE_MIN_QUESTIONS = 5;
const SPREAD_WINDOW = 10;

/** Local calendar day, e.g. "2026-10-15". */
const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Practice summary from rounds sorted oldest first. `now` is injectable for tests. */
export function practiceOf(results: RoundResult[], now = new Date()): PracticeSummary {
  const days = new Set(results.map((r) => dayOf(r.playedAt)));
  // The same streak the Games tab shows (see src/games/lookRemember/daily.ts).
  const { current: streak, best: bestStreak } = streakOf(results, localDay(now));

  const last = results.slice(-SPREAD_WINDOW).map((r) => r.score);
  const mean = average(last);
  const spread = last.length >= 5 ? Math.sqrt(average(last.map((x) => (x - mean) ** 2))) : null;

  const accuracy = (rounds: RoundResult[], type: QuestionType) => {
    const correct = rounds.reduce((n, r) => n + (r.byType[type]?.correct ?? 0), 0);
    const total = rounds.reduce((n, r) => n + (r.byType[type]?.total ?? 0), 0);
    return total >= CHANGE_MIN_QUESTIONS ? correct / total : null;
  };
  const recent = results.slice(-CHANGE_WINDOW);
  const earlier = results.slice(-2 * CHANGE_WINDOW, -CHANGE_WINDOW);
  const typeChanges = QUESTION_TYPES.flatMap((type): TypeChange[] => {
    const before = accuracy(earlier, type);
    const after = accuracy(recent, type);
    return before === null || after === null ? [] : [{ type, before, after }];
  });

  const timed = results.filter((r) => r.viewSeconds !== undefined && r.lookedSeconds !== undefined);
  const spare = (rounds: RoundResult[]) => average(rounds.map((r) => r.viewSeconds! - r.lookedSeconds!));
  const recentTimed = timed.slice(-CHANGE_WINDOW);
  const earlierTimed = timed.slice(-2 * CHANGE_WINDOW, -CHANGE_WINDOW);
  const earlyFinish =
    recentTimed.length >= 3 ? { recent: spare(recentTimed), before: earlierTimed.length >= 3 ? spare(earlierTimed) : null } : null;

  return { daysPlayed: days.size, streak, bestStreak, spread, typeChanges, earlyFinish };
}

export function playedLevelsOf(results: RoundResult[]): PlayedLevel[] {
  const rows = new Map<string, PlayedLevel & { total: number }>();
  for (const r of results) {
    // Replays and the Daily Challenge (its own kind of round) aren't level or practice rows.
    if (r.replay || r.mode === 'daily') continue;
    const key = r.ladder ? `level-${r.ladder.level}` : `practice-${r.level}`;
    const row = rows.get(key) ?? { key, level: r.ladder?.level, band: r.ladder ? undefined : r.level, rounds: 0, average: 0, bestPoints: 0, total: 0 };
    row.rounds += 1;
    row.total += r.score;
    row.average = row.total / row.rounds;
    row.bestPoints = Math.max(row.bestPoints, r.points ?? 0);
    rows.set(key, row);
  }
  const all = [...rows.values()].map(({ total: _total, ...row }) => row);
  const levels = all.filter((r) => r.level !== undefined).sort((a, b) => b.level! - a.level!);
  const practice = LEVEL_ORDER.flatMap((band) => all.filter((r) => r.band === band));
  return [...levels, ...practice];
}

export function summarize(
  allResults: RoundResult[],
  { chartRounds = 20, sessionCount = 10 } = {},
): StatsSummary {
  // Super Speed Rounds (8 quick Yes / No questions, a bonus) aren't part of your scores, accuracy or levels.
  const results = allResults.filter((r) => !r.speed && !r.boss).sort((a, b) => a.playedAt.localeCompare(b.playedAt));

  const levels = LEVEL_ORDER.map((level): LevelSummary => {
    const own = results.filter((r) => r.level === level);
    const scores = own.map((r) => r.score);
    return {
      level,
      rounds: own.length,
      average: average(scores),
      best: scores.length ? Math.max(...scores) : 0,
      trend: trendOf(own),
    };
  });

  const types = QUESTION_TYPES.map((type): TypeSummary => {
    let correct = 0;
    let total = 0;
    for (const r of results) {
      correct += r.byType[type]?.correct ?? 0;
      total += r.byType[type]?.total ?? 0;
    }
    return { type, correct, total, accuracy: total ? correct / total : 0 };
  });

  const sessionsById = new Map<string, SessionSummary>();
  for (const r of results) {
    const session = sessionsById.get(r.sessionId) ?? {
      id: r.sessionId,
      startedAt: r.playedAt,
      mode: r.mode,
      rounds: 0,
      correct: 0,
      total: 0,
      average: 0,
      points: 0,
    };
    if (r.ladder) {
      session.levelFrom ??= r.ladder.level;
      session.levelTo = r.ladder.after.level;
    }
    session.points += r.points ?? 0;
    session.rounds += 1;
    session.correct += r.score;
    session.total += r.total;
    session.average = session.correct / session.rounds;
    sessionsById.set(r.sessionId, session);
  }
  const sessions = [...sessionsById.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return {
    rounds: results.length,
    sessions: sessions.length,
    average: average(results.map((r) => r.score)),
    perfectRounds: results.filter((r) => r.score === r.total).length,
    trend: trendOf(results),
    levels,
    types,
    recentSessions: sessions.slice(0, sessionCount),
    playedLevels: playedLevelsOf(results),
    recentRounds: results.slice(-chartRounds),
    practice: practiceOf(results),
  };
}
