/**
 * Checks the Peek rules (src/games/lookRemember/peeks.ts and the peek in points.ts): earning one per
 * PEEK_POINTS, holding at most MAX_PEEKS, spending, rebuilding the wallet from saved rounds, and half points
 * for a peeked answer. Also prints how many good rounds earn a Peek at a few levels. Run with `npm run check:peeks`.
 */
import { EMPTY_WALLET, MAX_PEEKS, PEEK_POINTS, earnPeeks, spendPeek, walletOf } from '@/games/lookRemember/peeks';
import { pointsFor } from '@/games/lookRemember/points';
const round = (points: number, peeked = false) => ({ points, peeked: peeked || undefined }) as any;
let failed = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(ok ? '✓' : '✗', name, ok ? '' : `got ${JSON.stringify(got)}`);
};
check('starts empty', walletOf([]), { peeks: 0, toward: 0 });
check('one per PEEK_POINTS', earnPeeks(EMPTY_WALLET, PEEK_POINTS + 250), { wallet: { peeks: 1, toward: 250 }, earned: 1 });
check('points add up across rounds', walletOf([round(1800), round(1800)]), { peeks: 1, toward: 600 });
check('never more than MAX_PEEKS', walletOf([round(PEEK_POINTS * 10)]).peeks, MAX_PEEKS);
check('earned while full counts as 0 earned', earnPeeks({ peeks: MAX_PEEKS, toward: 0 }, PEEK_POINTS).earned, 0);
check('spending', spendPeek({ peeks: 2, toward: 100 }), { peeks: 1, toward: 100 });
check('never below 0', spendPeek(EMPTY_WALLET).peeks, 0);
check('a round spends before it earns (full wallet, peek, then points)', walletOf([round(PEEK_POINTS * 3), round(PEEK_POINTS, true)]).peeks, MAX_PEEKS);
check('rounds without points', walletOf([{ peeked: undefined } as any]), { peeks: 0, toward: 0 });

const all = [true, true, true, true, true];
const plain = pointsFor({ correct: all, level: 10, viewSeconds: 8, lookedSeconds: 8 });
const peekedRight = pointsFor({ correct: all, level: 10, viewSeconds: 8, lookedSeconds: 8, peeked: 2 });
check('peeked right answer: half its points', [plain.total - peekedRight.total, peekedRight.peeked], [95, 95]);
const peekedWrong = pointsFor({ correct: [true, true, false, true, true], level: 10, viewSeconds: 8, lookedSeconds: 8, peeked: 2 });
check('peeked wrong answer: nothing extra lost', [peekedWrong.peeked, peekedWrong.total], [undefined, pointsFor({ correct: [true, true, false, true, true], level: 10, viewSeconds: 8, lookedSeconds: 8 }).total]);
const early = pointsFor({ correct: all, level: 1, viewSeconds: 10, lookedSeconds: 6, peeked: 0 });
check('no "ready early" bonus for the peeked answer', early.ready, 4 * 5 * 4);

// How often Peeks come: good rounds (4 of 5 right, at the full time) per Peek.
for (const level of [1, 10, 20, 30]) {
  const p = pointsFor({ correct: [true, true, true, true, false], level, viewSeconds: 8, lookedSeconds: 8 }).total;
  console.log(`  level ${level}: a 4-of-5 round scores ${p}, so a Peek every ${(PEEK_POINTS / p).toFixed(1)} such rounds`);
}
if (failed) process.exit(1);
