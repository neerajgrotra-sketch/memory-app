import { LEVEL_ORDER } from '@/game/difficulty';
import type { Difficulty, Level, QuestionType } from '@/types/game';
import type { RoundResult } from '@/types/stats';

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
  mode: Difficulty;
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
  /** How much scores vary over the last rounds (standard deviation, out of 5); null until enough rounds. */
  spread: number | null;
  typeChanges: TypeChange[];
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
  /** Oldest first, for the chart. */
  recentRounds: RoundResult[];
  practice: PracticeSummary;
}

const QUESTION_TYPES: QuestionType[] = ['object', 'count', 'colour', 'position'];

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
  let streak = 0;
  const cursor = new Date(now);
  if (!days.has(dayOf(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayOf(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

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

  return { daysPlayed: days.size, streak, spread, typeChanges };
}

export function summarize(
  allResults: RoundResult[],
  { chartRounds = 20, sessionCount = 10 } = {},
): StatsSummary {
  const results = [...allResults].sort((a, b) => a.playedAt.localeCompare(b.playedAt));

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
    };
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
    recentRounds: results.slice(-chartRounds),
    practice: practiceOf(results),
  };
}
