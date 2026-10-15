export type QuestionType = 'object' | 'count' | 'colour' | 'position' | 'number';

/** Modes saved by older versions; 'progressive' is no longer offered but old rounds keep it. */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'progressive';

/** The fixed bands: Practice modes, and how charts group levelled rounds. */
export type Level = Exclude<Difficulty, 'progressive'>;

/** How a round is played: on your own level (which moves), or as Practice at a fixed band. */
export type PlayMode = 'levels' | Level;

/** A question about a picture, before it is prepared for a round. */
export interface Question {
  id: string;
  /** The scene it is about. */
  sceneId: string;
  type: QuestionType;
  prompt: string;
  /** Exactly four options. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
  /** What the question is about; a round avoids asking about the same thing twice. */
  subject?: string;
}

/** A question prepared for one round: options shuffled, answer re-indexed. */
export interface RoundQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answerIndex: number;
}
