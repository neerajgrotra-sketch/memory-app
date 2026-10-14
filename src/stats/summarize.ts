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
  };
}
