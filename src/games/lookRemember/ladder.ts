import type { LevelConfig } from '@/game/difficulty';
import { pointsPerAnswer } from '@/games/lookRemember/points';
import type { ClockStep } from '@/scenes/clock';
import type { Level, QuestionFamily, QuestionType } from '@/types/game';
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

/** A value that steps up at the given levels: `steps(level, [[1, 10], [4, 9]])` is 10 until Level 4, then 9. */
function steps<T>(level: number, table: [number, T][]): T {
  let value = table[0][1];
  for (const [from, v] of table) if (level >= from) value = v;
  return value;
}

/** The kinds of question, each from the level it starts at. Every early level brings one in. */
const FAMILY_FROM: [QuestionFamily, number][] = [
  ['what-here', 1],
  ['seen', 1],
  ['colour', 1],
  ['true-false', 1],
  ['twins', 1],
  // How many from the start: without it Level 1 had too few kinds of question to keep a session varied.
  ['count', 1],
  ['compare', 1],
  ['most', 1],
  // What was happening: the kettle steaming, the person's hat, the dog's stick.
  ['story', 1],
  ['detail', 3],
  ['where', 4],
  ['two-step', 5],
  ['relation', 9],
  ['altogether', 11],
  ['difference', 27],
  ['sharing', 29],
];

/**
 * What a level asks of you. Every level brings one named new thing (shown on the level-up screen, `unlocksAt`): a
 * place on the even levels, and on the odd ones a kind of question, a twist (clocks, hiding animals, mixed colours)
 * or a step in time or fullness. The changes are spread out so none bunch up and no level is a sudden jump; Level 30
 * is kept for a final round still to come. `check:levels` checks it stays that way.
 */
export function knobsForLevel(rawLevel: number): LevelConfig {
  const level = clampLevel(rawLevel);
  // Harder questions come in four steps (4, 8, 18, 23), never all at once.
  const preferredTypes = steps<QuestionType[]>(level, [
    [1, ['object', 'colour']],
    [4, ['object', 'count', 'colour', 'position']],
    [8, ['object', 'count', 'colour', 'position', 'number']],
    [18, ['object', 'count', 'position', 'number']],
    [23, ['count', 'position', 'number']],
  ]);
  return {
    preferredTypes,
    // 9 s from Level 2: the living room has fewer things than the beach, so at 10 s Level 2 was easier than Level 1.
    viewSeconds: steps(level, [[1, 10], [2, 9], [8, 8], [12, 7], [16, 6], [21, 5], [25, 4]]),
    // The 8th kind comes with the supermarket, whose neat shelves hold fewer things than other places.
    groups: steps(level, [[1, 5], [5, 6], [9, 7], [14, 8], [17, 9]]),
    maxCount: steps(level, [[1, 3], [2, 4], [10, 5], [16, 6]]),
    closeCounts: level >= 11,
    mixedColours: level >= 15,
    houseNumbers: level >= 3,
    clockStep: steps<ClockStep>(level, [[1, 60], [7, 30], [17, 15]]),
    hidden: steps<0 | 1 | 2>(level, [[1, 0], [13, 1], [19, 2]]),
    families: FAMILY_FROM.filter(([, from]) => level >= from).map(([family]) => family),
  };
}

/** Levels that bring nothing new yet: kept for the new kinds of question and round still to come. */
export const LEVELS_TO_FILL = [30];

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

/** The street's house numbers: asked once details are, in the city. */
const streetHouses = (level: number) => knobsForLevel(level).houseNumbers && recipesForLevel(level).includes('city');

/** The kinds of question a level brings in, in words. */
const FAMILY_NEWS: Partial<Record<QuestionFamily, string>> = {
  count: 'New questions: how many, and which there was more of',
  detail: 'New questions about details: clocks, numbers and signs',
  where: 'New questions: where was it?',
  relation: 'New questions: what was above or below something',
  'two-step': 'New questions in two steps: find the thing by where it was, then say its colour',
  altogether: 'Sums: how many of two things altogether?',
  difference: 'Sums: how many more of one thing than another?',
  sharing: 'Sharing: split them into equal groups, how many in each?',
};
const newFamilies = (before: LevelConfig, now: LevelConfig) =>
  (now.families ?? []).filter((f) => !(before.families ?? []).includes(f) && FAMILY_NEWS[f]);

/** What's new when you reach `level`, in words, for the level-up screen. */
export function unlocksAt(level: number): string[] {
  if (level <= 1) return [];
  const before = knobsForLevel(level - 1);
  const now = knobsForLevel(level);
  const news: string[] = [];
  for (const r of RECIPE_UNLOCKS) if (r.level === level) news.push(`A new place: ${r.name}`);
  if (streetHouses(level) && !streetHouses(level - 1)) news.push('House numbers and colours to remember in the street');
  if (now.mixedColours && !before.mixedColours) news.push('Fish, sheep, plates and more can each be a different colour');
  if (now.clockStep < before.clockStep) news.push(now.clockStep === 30 ? 'Clocks can show half past' : 'Clocks can show quarter past and quarter to');
  if (now.closeCounts && !before.closeCounts) news.push('Closer choices when counting');
  if (now.hidden > before.hidden) news.push(now.hidden === 1 ? 'Animals hiding in the picture: find where' : 'Hiding animals show less of themselves');
  if (now.groups > before.groups) news.push(`More to remember: ${now.groups} different kinds of thing in each picture`);
  if (now.maxCount > before.maxCount) news.push(`Pictures can now have up to ${now.maxCount} of one thing, like ${now.maxCount} kites`);
  if (now.viewSeconds < before.viewSeconds) news.push(`Pictures stay for ${now.viewSeconds} seconds`);
  for (const family of newFamilies(before, now)) news.push(FAMILY_NEWS[family]!);
  const added = now.preferredTypes.filter((t) => !before.preferredTypes.includes(t));
  const dropped = before.preferredTypes.filter((t) => !now.preferredTypes.includes(t));
  if (added.includes('count')) news.push('More questions on how many and where');
  if (added.includes('number')) news.push('More questions on numbers and times');
  if (dropped.includes('colour')) news.push('Fewer colour questions, more on how many and where');
  if (dropped.includes('object')) news.push('Mostly harder questions: how many, where, and numbers');
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
    const family = newFamilies(before, now)[0];
    if (family) return { level: l, text: FAMILY_NEWS[family]!.replace(/^New questions( about)?: /, '').replace(/^./, (c) => c.toUpperCase()) };

    if (now.mixedColours && !before.mixedColours) return { level: l, text: 'Things in mixed colours' };
    if (now.clockStep < before.clockStep) return { level: l, text: now.clockStep === 30 ? 'Clocks at half past' : 'Clocks at quarter past and quarter to' };
    if (now.closeCounts && !before.closeCounts) return { level: l, text: 'Closer choices when counting' };
    if (now.hidden > before.hidden) return { level: l, text: now.hidden === 1 ? 'Hiding animals' : 'Better-hidden animals' };
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
/** `startLevel`: the level a "start again" put you on (1, or any level a tester picked). */
export function ladderStateOf(results: RoundResult[], restartedAt?: string | null, startLevel = 1): { state: LadderState; fromHistory: boolean } {
  const sorted = [...results].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const lastLevelled = (rounds: RoundResult[]) => [...rounds].reverse().find((r) => r.mode === 'levels' && r.ladder);
  if (restartedAt) {
    // Started again: Level 1 (or a tester's chosen level), unless rounds have been played since. The best level ever is kept.
    const since = lastLevelled(sorted.filter((r) => r.playedAt > restartedAt));
    if (since?.ladder) return { state: since.ladder.after, fromHistory: false };
    const before = ladderStateOf(sorted.filter((r) => r.playedAt <= restartedAt)).state;
    return { state: { ...FIRST_STATE, level: startLevel, best: Math.max(1, before.best) }, fromHistory: false };
  }
  const last = lastLevelled(sorted);
  if (last?.ladder) return { state: last.ladder.after, fromHistory: false };
  const level = startingLevel(sorted);
  return { state: { ...FIRST_STATE, level, best: level }, fromHistory: level > 1 };
}
