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

/** The wallet after every saved round, oldest first (a round's peek was used before its points came in). */
export function walletOf(results: RoundResult[]): PeekWallet {
  return results.reduce((w, r) => earnPeeks(r.peeked ? spendPeek(w) : w, r.points ?? 0).wallet, EMPTY_WALLET);
}
