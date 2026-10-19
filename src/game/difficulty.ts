import type { ClockStep } from '@/scenes/clock';
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
  /** Ask about the backdrop's details: house numbers and colours in the street, the barn's colour on the farm. */
  houseNumbers: boolean;
  /** How exact the time on a clock is: whole hours (Easy), half past (Medium), quarters (Hard). */
  clockStep: ClockStep;
  /**
   * Animals hiding in the picture (the snowy mountain's danger animal peeks out from behind something):
   * 0 none, 1 a clear peek (head and ears), 2 a small one (ears and eyes).
   */
  hidden: 0 | 1 | 2;
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: { preferredTypes: ['object', 'colour'], viewSeconds: 10, groups: 5, maxCount: 3, closeCounts: false, mixedColours: false, houseNumbers: false, clockStep: 60, hidden: 0 },
  medium: {
    preferredTypes: ['object', 'count', 'colour', 'position'],
    viewSeconds: 8,
    groups: 7,
    maxCount: 4,
    closeCounts: false,
    mixedColours: false,
    houseNumbers: true,
    clockStep: 30,
    hidden: 0,
  },
  hard: { preferredTypes: ['count', 'position', 'number'], viewSeconds: 6, groups: 9, maxCount: 6, closeCounts: true, mixedColours: true, houseNumbers: true, clockStep: 15, hidden: 1 },
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
  daily: 'Daily challenge',
  easy: 'Practice · Easy',
  medium: 'Practice · Medium',
  hard: 'Practice · Hard',
  progressive: 'Progressive',
};

export function isPlayMode(value: unknown): value is PlayMode {
  return value === 'levels' || value === 'daily' || LEVEL_ORDER.includes(value as Level);
}
