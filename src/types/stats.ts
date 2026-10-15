import type { Difficulty, Level, QuestionType } from './game';

export interface TypeTally {
  correct: number;
  total: number;
}

/** One finished round of 5 questions (mirrors a future `round_results` table row). */
export interface RoundResult {
  id: string;
  /** Groups rounds played in one go, from picking a mode until going home. */
  sessionId: string;
  /** ISO timestamp. */
  playedAt: string;
  /** The mode picked on the home screen. */
  mode: Difficulty;
  /** The level this round was played at. */
  level: Level;
  /** The setting, e.g. "beach". */
  recipeId: string;
  sceneId: string;
  score: number;
  total: number;
  byType: Partial<Record<QuestionType, TypeTally>>;
}
