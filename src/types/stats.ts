import type { LadderState } from '@/games/lookRemember/ladder';

import type { Difficulty, Level, PlayMode, QuestionType } from './game';

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
  /** The game; missing on rounds saved before there were several games (Look & Remember). */
  gameId?: string;
  /** Levels, a Practice band, or (older rounds) Progressive. */
  mode: PlayMode | Difficulty;
  /** The band this round was played at (for levelled rounds, the band its level falls in). */
  level: Level;
  /** Levelled rounds: the level played and the player's level afterwards. */
  ladder?: { level: number; after: LadderState };
  /** Points scored (rounds from before points existed have none). */
  points?: number;
  /** The setting, e.g. "beach". */
  recipeId: string;
  sceneId: string;
  score: number;
  total: number;
  /** Seconds the picture could be shown, and how long the player actually looked (they can finish early). */
  viewSeconds?: number;
  lookedSeconds?: number;
  byType: Partial<Record<QuestionType, TypeTally>>;
}
