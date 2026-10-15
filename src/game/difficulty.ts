import type { Difficulty, Level, QuestionType } from '@/types/game';

export const ROUND_SIZE = 5;

export interface LevelConfig {
  /** Question types picked first; the rest of the pool tops up the round if needed. */
  preferredTypes: QuestionType[];
  /** How long the picture is shown. */
  viewSeconds: number;
  /** How many different kinds of thing are in the picture. */
  groups: number;
  /** Most of any one kind. */
  maxCount: number;
  /** Wrong counts right next to the answer (4 vs 5). */
  closeCounts: boolean;
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: { preferredTypes: ['object', 'colour'], viewSeconds: 10, groups: 5, maxCount: 3, closeCounts: false },
  medium: {
    preferredTypes: ['object', 'count', 'colour', 'position'],
    viewSeconds: 8,
    groups: 7,
    maxCount: 4,
    closeCounts: false,
  },
  hard: { preferredTypes: ['count', 'position'], viewSeconds: 6, groups: 9, maxCount: 6, closeCounts: true },
};

export const LEVEL_LABELS: Record<Level, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '10 seconds · a few things to spot' },
  { value: 'medium', label: 'Medium', description: '8 seconds · busier pictures' },
  { value: 'hard', label: 'Hard', description: '6 seconds · crowded pictures, close answers' },
  { value: 'progressive', label: 'Progressive', description: 'Starts easy, gets harder each round' },
];

export const LEVEL_ORDER: Level[] = ['easy', 'medium', 'hard'];

/** Resolves the level for a round (0-based). Progressive steps up and stays on hard. */
export function levelForRound(difficulty: Difficulty, round: number): Level {
  if (difficulty !== 'progressive') return difficulty;
  return LEVEL_ORDER[Math.min(round, LEVEL_ORDER.length - 1)];
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTY_OPTIONS.some((option) => option.value === value);
}
