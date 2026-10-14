import type { Difficulty, QuestionType } from '@/types/game';

export const ROUND_SIZE = 5;
export const VIEW_SECONDS = 10;

export interface LevelConfig {
  /** Question types picked first; the rest of the pool tops up the round if needed. */
  preferredTypes: QuestionType[];
}

type Level = Exclude<Difficulty, 'progressive'>;

export const LEVELS: Record<Level, LevelConfig> = {
  easy: { preferredTypes: ['object', 'colour'] },
  medium: { preferredTypes: ['object', 'count', 'colour', 'position'] },
  hard: { preferredTypes: ['count', 'position'] },
};

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'What and which colour' },
  { value: 'medium', label: 'Medium', description: 'A mix of everything' },
  { value: 'hard', label: 'Hard', description: 'How many and where' },
  { value: 'progressive', label: 'Progressive', description: 'Starts easy, gets harder each round' },
];

const PROGRESSION: Level[] = ['easy', 'medium', 'hard'];

/** Resolves the level for a round (0-based). Progressive steps up and stays on hard. */
export function levelForRound(difficulty: Difficulty, round: number): Level {
  if (difficulty !== 'progressive') return difficulty;
  return PROGRESSION[Math.min(round, PROGRESSION.length - 1)];
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTY_OPTIONS.some((option) => option.value === value);
}
