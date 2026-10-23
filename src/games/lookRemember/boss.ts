import type { LevelConfig } from '@/game/difficulty';
import { BOSSES, knobsForLevel } from '@/games/lookRemember/ladder';
import type { RoundResult } from '@/types/stats';

/**
 * Boss rounds: at Levels 10, 20 and 30, a round in a busy picture of one place (`BOSSES` in ladder.ts), with a
 * shorter look and harder questions. Getting 4 of 5 right beats the boss and wins its badge (and a Peek, the first
 * time). Once reached, a boss can be taken on again any time from the game page; it never moves your level.
 */

export type Boss = (typeof BOSSES)[number];
export { BOSSES };

/** Right answers out of 5 that beat a boss. */
export const BOSS_TO_WIN = 4;
/** Boss rounds are worth double points. */
export const BOSS_MULTIPLIER = 2;
/** Never shorter than this to look. */
const MIN_BOSS_SECONDS = 4;

export const bossAt = (level: number): Boss | undefined => BOSSES.find((b) => b.level === level);

/**
 * The boss's settings: the level's, with two more kinds of thing, one more of each at most, a second less to look
 * (never under 4) and harder questions first (how many, where, numbers). Its looking time per thing is about that of
 * the level ten above (two seconds less made the Level 20 boss harder than Level 30).
 */
export function bossKnobs(boss: Boss): LevelConfig {
  const base = knobsForLevel(boss.level);
  return {
    ...base,
    groups: base.groups + 2,
    maxCount: Math.min(7, base.maxCount + 1),
    viewSeconds: Math.max(MIN_BOSS_SECONDS, base.viewSeconds - 1),
    preferredTypes: ['count', 'position', 'number'],
    typeCaps: { object: 1 },
    storyMin: Math.max(2, base.storyMin ?? 0),
  };
}

/** Bosses you can take on: every one at or below the best level you've reached (a tester can take on any). */
export const bossesOpen = (bestLevel: number, tester = false): Boss[] => BOSSES.filter((b) => tester || b.level <= bestLevel);

export const bossBeatenBy = (r: Pick<RoundResult, 'boss' | 'score'>) => r.boss !== undefined && r.score >= BOSS_TO_WIN;

/** The levels of the bosses beaten, from saved rounds. */
export function bossesBeaten(results: RoundResult[]): Set<number> {
  return new Set(results.filter(bossBeatenBy).map((r) => r.boss!));
}
