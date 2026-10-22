import type { RoundResult } from '@/types/stats';

/**
 * Peeks: a second look at the picture while answering. Points earn them (one per PEEK_POINTS, keeping at
 * most MAX_PEEKS), and using one spends it. They're never bought and never cost points.
 *
 * The wallet isn't stored: it's worked out again from saved rounds (each round's points, and whether it
 * used a peek), so it can't drift from the history and "Delete all progress" empties it too.
 */

/** Points that earn one Peek. */
export const PEEK_POINTS = 3000;
/** Peeks you can hold; points earned while full still count towards the next one. */
export const MAX_PEEKS = 3;
/** How long a peek shows the picture. */
export const PEEK_SECONDS = 3;
/** The lengths a tester can try (Profile → Tester mode → Peek time). */
export const PEEK_SECONDS_CHOICES = [1, 2, 3, 4, 5];

/** How long a Peek lasts for this player: the standard, or a tester's chosen length. */
export const peekSecondsFor = (profile: { tester?: boolean; peekSeconds?: number } | null | undefined): number =>
  profile?.tester && profile.peekSeconds && PEEK_SECONDS_CHOICES.includes(profile.peekSeconds) ? profile.peekSeconds : PEEK_SECONDS;
/** A question answered right after a peek earns this share of its points (its only cost: the round still counts for your level). */
export const PEEKED_SHARE = 0.5;

export interface PeekWallet {
  peeks: number;
  /** Points towards the next Peek (0 to PEEK_POINTS - 1). */
  toward: number;
}

export const EMPTY_WALLET: PeekWallet = { peeks: 0, toward: 0 };

/** After using a peek. */
export const spendPeek = (w: PeekWallet): PeekWallet => ({ ...w, peeks: Math.max(0, w.peeks - 1) });

/** After scoring `points`: the new wallet and how many Peeks were earned. */
export function earnPeeks(w: PeekWallet, points: number): { wallet: PeekWallet; earned: number } {
  const total = w.toward + Math.max(0, Math.round(points));
  const whole = Math.floor(total / PEEK_POINTS);
  const peeks = Math.min(MAX_PEEKS, w.peeks + whole);
  return { wallet: { peeks, toward: total % PEEK_POINTS }, earned: peeks - w.peeks };
}

/** Peeks won as a prize (a Super Speed Round), kept within MAX_PEEKS. */
export const winPeeks = (w: PeekWallet, n: number): PeekWallet => ({ ...w, peeks: Math.min(MAX_PEEKS, w.peeks + Math.max(0, n)) });

/** The wallet after every saved round, oldest first (a round's peek was used before its points came in). */
export function walletOf(results: RoundResult[]): PeekWallet {
  return results.reduce((w, r) => winPeeks(earnPeeks(r.peeked ? spendPeek(w) : w, r.points ?? 0).wallet, r.bonus?.peeks ?? 0), EMPTY_WALLET);
}

/**
 * 50:50s: a lifeline that takes away two wrong answers (one when there are three), won in a Super Speed Round. An
 * answer after a 50:50 earns half points, like a Peek. Worked out from saved rounds, like Peeks.
 */
export const MAX_FIFTY = 2;

export function fiftyOf(results: RoundResult[]): number {
  return results.reduce((n, r) => Math.min(MAX_FIFTY, Math.max(0, n - (r.fifty ? 1 : 0)) + (r.bonus?.fifty ?? 0)), 0);
}

/**
 * The wrong options a 50:50 takes away from a question: two of three, or one of two. Picked from the question's id, so a
 * resumed round takes away the same ones. None for a question with two options.
 */
export function fiftyHidden(question: { id: string; options: string[]; answerIndex: number }): number[] {
  const wrong = question.options.map((_, i) => i).filter((i) => i !== question.answerIndex);
  if (wrong.length < 2) return [];
  let h = 0;
  for (const c of question.id) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  const keep = wrong[Math.abs(h) % wrong.length];
  return wrong.filter((i) => i !== keep);
}
