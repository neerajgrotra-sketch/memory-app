export type QuestionType = 'object' | 'count' | 'colour' | 'position' | 'number';

/** Modes saved by older versions; 'progressive' is no longer offered but old rounds keep it. */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'progressive';

/** The fixed bands: Practice modes, and how charts group levelled rounds. */
export type Level = Exclude<Difficulty, 'progressive'>;

/** How a round is played: on your own level (which moves), or as Practice at a fixed band. */
/** Levels (your level moves), the Daily Challenge (one picture a day, at your level), or Practice at a fixed band. */
export type PlayMode = 'levels' | 'daily' | Level;

/**
 * The kind of question, finer than its type: a round mixes kinds (see `selectQuestions`), so it's never
 * five "where was…" questions in a row.
 */
export type QuestionFamily =
  | 'count'
  | 'colour'
  | 'where'
  | 'what-here'
  | 'seen'
  | 'compare'
  | 'most'
  | 'relation'
  | 'twins'
  | 'true-false'
  | 'detail'
  /** "Only one kind of thing was on the pond. What colour was it?": find it by where it was, then remember its colour. */
  | 'two-step'
  /** Sums on what you saw: "How many … and … altogether?" */
  | 'altogether'
  /** "How many more … than …?" */
  | 'difference'
  /** Division: "If the … were split into 2 equal groups, how many would be in each?" */
  | 'sharing';

/** A question about a picture, before it is prepared for a round. */
export interface Question {
  id: string;
  /** The scene it is about. */
  sceneId: string;
  type: QuestionType;
  prompt: string;
  /** Two to four options (two for true or false). */
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
  /** What the question is about; a round avoids asking about the same thing twice. */
  subject?: string;
  family?: QuestionFamily;
  /**
   * The question's wording, whatever it's about ("colour" for every "What colour was the …?", "fact:clock-time"):
   * a round avoids the wordings of the round before, so a session doesn't keep asking the same sentence.
   */
  template?: string;
  /** Asked first when it's in the picture (the time on a clock: rare, so always worth asking). */
  spotlight?: boolean;
  /** Keep the options in this order (True before False; "The same number" last). */
  fixedOrder?: boolean;
}

/** A question prepared for one round: options shuffled, answer re-indexed. */
export interface RoundQuestion {
  id: string;
  type: QuestionType;
  /** See `Question.template`. */
  template?: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}
