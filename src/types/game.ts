export type QuestionType = 'object' | 'count' | 'colour' | 'position';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'progressive';

/** The level a round is actually played at (Progressive steps through these). */
export type Level = Exclude<Difficulty, 'progressive'>;

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
