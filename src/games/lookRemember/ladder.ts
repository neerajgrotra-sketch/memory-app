import type { LevelConfig } from '@/game/difficulty';
import { pointsPerAnswer } from '@/games/lookRemember/points';
import type { Level, QuestionType } from '@/types/game';
import type { RoundResult } from '@/types/stats';

/**
 * Look & Remember's levels: 1 to 30, each a little harder than the one before. Your level moves by itself:
 * a few good rounds take you up, and only a run of very poor ones brings you down.
 */

export const MAX_LEVEL = 30;
/** Good rounds needed to go up a level. */
export const ROUNDS_TO_LEVEL_UP = 3;
/** Very poor rounds in a row that bring you down a level. */
export const POOR_ROUNDS_TO_DROP = 2;

/** 4 or 5 out of 5. */
export const isGoodRound = (score: number, total: number) => score >= total - 1;
/** 0 or 1 out of 5. */
export const isPoorRound = (score: number) => score <= 1;

/** The score a round counts as for your level: right answers after a peek can't tip it into a good round. */
export function scoreForLevel(score: number, total: number, peekedRight: number): number {
  return isGoodRound(score, total) ? score - peekedRight : score;
}

export interface LadderState {
  level: number;
  /** Good rounds so far towards the next level (0 to ROUNDS_TO_LEVEL_UP - 1). */
  progress: number;
  /** Very poor rounds in a row. */
  poorStreak: number;
  /** The highest level reached. Never goes down. */
  best: number;
}

export const FIRST_STATE: LadderState = { level: 1, progress: 0, poorStreak: 0, best: 1 };

/** Your level after a round. */
export function applyRound(state: LadderState, score: number, total: number): LadderState {
  if (isGoodRound(score, total)) {
    if (state.level >= MAX_LEVEL) return { ...state, progress: ROUNDS_TO_LEVEL_UP, poorStreak: 0 };
    const progress = state.progress + 1;
    if (progress >= ROUNDS_TO_LEVEL_UP) {
      const level = state.level + 1;
      return { level, progress: 0, poorStreak: 0, best: Math.max(state.best, level) };
    }
    return { ...state, progress, poorStreak: 0 };
  }
  if (isPoorRound(score)) {
    const poorStreak = state.poorStreak + 1;
    if (poorStreak >= POOR_ROUNDS_TO_DROP && state.level > 1) {
      return { ...state, level: state.level - 1, progress: 0, poorStreak: 0 };
    }
    return { ...state, poorStreak };
  }
  return { ...state, poorStreak: 0 };
}

const clampLevel = (level: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round(level)));

/** What a level asks of you. Every value changes in small steps, so no level is a sudden jump. */
export function knobsForLevel(rawLevel: number): LevelConfig {
  const level = clampLevel(rawLevel);
  const preferredTypes: QuestionType[] =
    level < 5
      ? ['object', 'colour']
      : level < 8
        ? ['object', 'count', 'colour', 'position']
        : level < 18
          ? ['object', 'count', 'colour', 'position', 'number']
          : ['count', 'position', 'number'];
  return {
    preferredTypes,
    viewSeconds: Math.max(4, Math.round(10 - (level - 1) * 0.25)),
    groups: Math.min(9, 5 + Math.floor((level - 1) / 4)),
    maxCount: level < 4 ? 3 : level < 10 ? 4 : level < 16 ? 5 : 6,
    closeCounts: level >= 14,
    mixedColours: level >= 12,
    houseNumbers: level >= 8,
    clockStep: level < 8 ? 60 : level < 18 ? 30 : 15,
  };
}

/** The level each place first appears at. */
export const RECIPE_UNLOCKS: { recipeId: string; level: number; name: string }[] = [
  { recipeId: 'beach', level: 1, name: 'the beach' },
  { recipeId: 'living-room', level: 2, name: 'the living room' },
  { recipeId: 'park', level: 4, name: 'the park' },
  { recipeId: 'city', level: 6, name: 'the city street' },
  { recipeId: 'kitchen', level: 8, name: 'the kitchen' },
  { recipeId: 'farm', level: 10, name: 'the farm' },
  { recipeId: 'under-sea', level: 12, name: 'under the sea' },
  { recipeId: 'supermarket', level: 14, name: 'the supermarket' },
  { recipeId: 'train-station', level: 16, name: 'the train station' },
  { recipeId: 'zoo', level: 18, name: 'the zoo' },
  { recipeId: 'snowy-mountain', level: 20, name: 'the snowy mountain' },
  { recipeId: 'classroom', level: 22, name: 'the classroom' },
  { recipeId: 'night-campsite', level: 24, name: 'the campsite at night' },
  { recipeId: 'airport', level: 26, name: 'the airport' },
  { recipeId: 'space', level: 28, name: 'the Moon, out in space' },
];

export const recipesForLevel = (level: number) => RECIPE_UNLOCKS.filter((r) => r.level <= level).map((r) => r.recipeId);

/** What's new when you reach `level`, in words, for the level-up screen. */
export function unlocksAt(level: number): string[] {
  if (level <= 1) return [];
  const before = knobsForLevel(level - 1);
  const now = knobsForLevel(level);
  const news: string[] = [];
  for (const r of RECIPE_UNLOCKS) if (r.level === level) news.push(`A new place: ${r.name}`);
  if (now.houseNumbers && !before.houseNumbers) news.push('House numbers to remember in the street');
  if (now.mixedColours && !before.mixedColours) news.push('Fire hydrants can each be a different colour');
  if (now.clockStep < before.clockStep) news.push(now.clockStep === 30 ? 'Clocks can show half past' : 'Clocks can show quarter past and quarter to');
  if (now.closeCounts && !before.closeCounts) news.push('Closer choices when counting');
  if (now.groups > before.groups) news.push('One more kind of thing in each picture');
  if (now.maxCount > before.maxCount) news.push(`Up to ${now.maxCount} of the same thing`);
  if (now.viewSeconds < before.viewSeconds) news.push(`Pictures stay for ${now.viewSeconds} seconds`);
  const added = now.preferredTypes.filter((t) => !before.preferredTypes.includes(t));
  const dropped = before.preferredTypes.filter((t) => !now.preferredTypes.includes(t));
  if (added.includes('count')) news.push('More questions on how many and where');
  if (dropped.length) news.push('Mostly harder questions: how many, where, and numbers');
  news.push(`Each right answer now scores ${pointsPerAnswer(level)} points`);
  return news;
}

/** The next level that brings something new to look for (a place or a kind of question), or null. */
export function nextBigUnlock(level: number): { level: number; text: string } | null {
  for (let l = level + 1; l <= MAX_LEVEL; l++) {
    const before = knobsForLevel(l - 1);
    const now = knobsForLevel(l);
    const place = RECIPE_UNLOCKS.find((r) => r.level === l);
    if (place) return { level: l, text: `A new place: ${place.name}` };
    if (now.houseNumbers && !before.houseNumbers) return { level: l, text: 'House numbers' };
    if (now.mixedColours && !before.mixedColours) return { level: l, text: 'Hydrants in different colours' };
    if (now.clockStep < before.clockStep) return { level: l, text: now.clockStep === 30 ? 'Clocks at half past' : 'Clocks at quarter past and quarter to' };
    if (now.closeCounts && !before.closeCounts) return { level: l, text: 'Closer choices when counting' };
  }
  return null;
}

/** A name for every 5 levels, so progress has milestones. */
const TITLES: { from: number; title: string }[] = [
  { from: 1, title: 'Fresh Eyes' },
  { from: 5, title: 'Sharp Eyes' },
  { from: 10, title: 'Keen Observer' },
  { from: 15, title: 'Detail Spotter' },
  { from: 20, title: 'Eagle Eye' },
  { from: 25, title: 'Total Recall' },
  { from: 30, title: 'Photographic Memory' },
];

export function titleFor(level: number): string {
  return [...TITLES].reverse().find((t) => level >= t.from)!.title;
}

/** The next milestone above `level`, or null at the top. */
export function nextTitle(level: number): { from: number; title: string } | null {
  return TITLES.find((t) => t.from > level) ?? null;
}

/** Practice modes, for points: roughly the level each plays like. */
export const PRACTICE_LEVEL: Record<Level, number> = { easy: 2, medium: 9, hard: 18 };

/** The old Easy / Medium / Hard bands, for charts and the practice table. */
export function bandOf(level: number): Level {
  return level < 8 ? 'easy' : level < 18 ? 'medium' : 'hard';
}

/** The levels in each band. Medium starts with house numbers (8), Hard with mostly harder questions (18). */
export const BAND_LEVELS: Record<Level, [number, number]> = { easy: [1, 7], medium: [8, 17], hard: [18, MAX_LEVEL] };

/**
 * Where a player starts who played before levels existed: the hardest band they did well at
 * (average 3.5 or more over their last rounds there, at least 3 rounds).
 */
export function startingLevel(results: RoundResult[]): number {
  const legacy = results.filter((r) => r.mode !== 'levels' && r.mode !== 'daily');
  const goodAt = (level: Level) => {
    const own = legacy.filter((r) => r.level === level).slice(-10);
    return own.length >= 3 && own.reduce((n, r) => n + r.score, 0) / own.length >= 3.5;
  };
  if (goodAt('hard')) return 14;
  if (goodAt('medium')) return 8;
  if (goodAt('easy')) return 3;
  return 1;
}

/** Your level now: from the last levelled round, or worked out from earlier rounds if there are none. */
export function ladderStateOf(results: RoundResult[], restartedAt?: string | null): { state: LadderState; fromHistory: boolean } {
  const sorted = [...results].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const lastLevelled = (rounds: RoundResult[]) => [...rounds].reverse().find((r) => r.mode === 'levels' && r.ladder);
  if (restartedAt) {
    // Started again: Level 1, unless rounds have been played since. The best level ever is kept.
    const since = lastLevelled(sorted.filter((r) => r.playedAt > restartedAt));
    if (since?.ladder) return { state: since.ladder.after, fromHistory: false };
    const before = ladderStateOf(sorted.filter((r) => r.playedAt <= restartedAt)).state;
    return { state: { ...FIRST_STATE, best: Math.max(1, before.best) }, fromHistory: false };
  }
  const last = lastLevelled(sorted);
  if (last?.ladder) return { state: last.ladder.after, fromHistory: false };
  const level = startingLevel(sorted);
  return { state: { ...FIRST_STATE, level, best: level }, fromHistory: level > 1 };
}
