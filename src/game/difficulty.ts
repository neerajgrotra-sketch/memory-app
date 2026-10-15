import type { Difficulty, Level, PlayMode, QuestionType } from '@/types/game';

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
  /** Copies of some things (fire hydrants) may each be a different colour. */
  mixedColours: boolean;
  /** Ask about house numbers and house colours in the street. */
  houseNumbers: boolean;
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: { preferredTypes: ['object', 'colour'], viewSeconds: 10, groups: 5, maxCount: 3, closeCounts: false, mixedColours: false, houseNumbers: false },
  medium: {
    preferredTypes: ['object', 'count', 'colour', 'position'],
    viewSeconds: 8,
    groups: 7,
    maxCount: 4,
    closeCounts: false,
    mixedColours: false,
    houseNumbers: true,
  },
  hard: { preferredTypes: ['count', 'position', 'number'], viewSeconds: 6, groups: 9, maxCount: 6, closeCounts: true, mixedColours: true, houseNumbers: true },
};

export const LEVEL_LABELS: Record<Level, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

/** Practice: a fixed band that never changes your level. */
export const PRACTICE_OPTIONS: { value: Level; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '10 seconds · a few things to spot' },
  { value: 'medium', label: 'Medium', description: '8 seconds · busier pictures' },
  { value: 'hard', label: 'Hard', description: '6 seconds · crowded pictures, close answers' },
];

export const LEVEL_ORDER: Level[] = ['easy', 'medium', 'hard'];

/** Names for every mode, including ones only older saved rounds have. */
export const MODE_LABELS: Record<PlayMode | Difficulty, string> = {
  levels: 'Levels',
  easy: 'Practice · Easy',
  medium: 'Practice · Medium',
  hard: 'Practice · Hard',
  progressive: 'Progressive',
};

export function isPlayMode(value: unknown): value is PlayMode {
  return value === 'levels' || LEVEL_ORDER.includes(value as Level);
}
