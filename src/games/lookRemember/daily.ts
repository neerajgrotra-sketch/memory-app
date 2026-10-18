import type { RoundResult } from '@/types/stats';

/**
 * The daily habit: a streak of days played, and one Daily Challenge picture per day.
 *
 * - **Streak:** days in a row with at least one finished round (any mode, any game). A streak is still
 *   alive today until midnight, so "3 days" shows all day before you play; it breaks only once a whole
 *   day passes without a round.
 * - **Daily Challenge:** one picture per day, the same all day (seeded by the date), at your level,
 *   double points, one attempt. It never changes your level or high score (like Practice).
 *
 * Days are the player's local calendar days. Everything is worked out from saved rounds, so there's
 * nothing extra to store or keep in step.
 */

/** "2026-10-17" for the local calendar day of `date`. */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The local day `n` days after `day` (negative for before). Safe across daylight-saving changes. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d + n, 12));
}

/** The seed for a day's challenge picture: the same all day, different every day. */
export function dailySeed(day: string): number {
  let h = 2166136261;
  for (const ch of `glance-daily-${day}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 2 ** 31;
}

/** Points are doubled for the Daily Challenge. */
export const DAILY_MULTIPLIER = 2;

/** Every local day with at least one finished round. */
export function daysPlayed(results: RoundResult[]): Set<string> {
  return new Set(results.map((r) => localDay(new Date(r.playedAt))));
}

export interface Streak {
  /** Days in a row up to today (or up to yesterday, if you haven't played yet today). */
  current: number;
  /** Already played today, so the streak is safe until tomorrow. */
  playedToday: boolean;
  /** The longest run ever. */
  best: number;
}

export function streakOf(results: RoundResult[], today: string = localDay()): Streak {
  const days = daysPlayed(results);
  const playedToday = days.has(today);
  let current = 0;
  for (let day = playedToday ? today : addDays(today, -1); days.has(day); day = addDays(day, -1)) current++;
  // The longest run: walk the sorted days, counting runs of consecutive ones.
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of [...days].sort()) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return { current, playedToday, best: Math.max(best, current) };
}

/** Monday to Sunday of this week: each day's short name, whether it was played, and which is today. */
export function weekOf(results: RoundResult[], today: string = localDay()) {
  const days = daysPlayed(results);
  const [y, m, d] = today.split('-').map(Number);
  const weekday = (new Date(y, m - 1, d, 12).getDay() + 6) % 7; // Monday = 0
  const monday = addDays(today, -weekday);
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
    const day = addDays(monday, i);
    return { day, label, played: days.has(day), isToday: day === today, future: day > today };
  });
}

/** Today's Daily Challenge round, if it's been played. */
export function dailyResultOn(results: RoundResult[], day: string = localDay()): RoundResult | null {
  return results.find((r) => r.mode === 'daily' && localDay(new Date(r.playedAt)) === day) ?? null;
}
