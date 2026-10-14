export type QuestionType = 'object' | 'count' | 'colour' | 'position';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'progressive';

/** The level a round is actually played at (Progressive steps through these). */
export type Level = Exclude<Difficulty, 'progressive'>;

/**
 * Where an image comes from. A remote URL (e.g. Supabase Storage) is a string;
 * an asset bundled with the app is the number returned by `require()`.
 */
export type ImageSource = string | number;

export interface GameImage {
  id: string;
  title: string;
  source: ImageSource;
}

/** A question as stored in the pool (mirrors a future `questions` table row). */
export interface Question {
  id: string;
  imageId: string;
  type: QuestionType;
  prompt: string;
  /** Exactly four options. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
}

/** A question prepared for one round: options shuffled, answer re-indexed. */
export interface RoundQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answerIndex: number;
}
