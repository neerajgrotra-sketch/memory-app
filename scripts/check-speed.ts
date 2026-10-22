/**
 * Checks the Super Speed Round (src/games/lookRemember/speed.ts) and the 50:50 (peeks.ts): eight quick questions from
 * every place at every level it's played, each answer true to the picture's own question, about half of them Yes, none
 * giving another away; when it comes (every 4 to 6 Levels rounds from Level 5); what each score wins; and 50:50s won,
 * spent and capped. Run with `npm run check:speed`.
 */
import { MAX_FIFTY, fiftyHidden, fiftyOf, walletOf } from '@/games/lookRemember/peeks';
import { knobsForLevel, recipesForLevel } from '@/games/lookRemember/ladder';
import { SPEED_FROM_LEVEL, SPEED_QUESTIONS, speedCounterOf, speedDue, speedGap, speedPrize, speedQuestions } from '@/games/lookRemember/speed';
import { createStage } from '@/scenes/createStage';
import type { RoundResult } from '@/types/stats';

let failed = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(ok ? '✓' : '✗', name, ok ? '' : `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};
const fail = (message: string) => {
  failed++;
  if (failed < 20) console.log('✗', message);
};

// The questions, from pictures at every level it's played.
const PICTURES = 1500;
let full = 0;
let yes = 0;
let asked = 0;
const places: Record<string, number> = {};
for (let k = 0; k < PICTURES; k++) {
  const level = SPEED_FROM_LEVEL + (k % (31 - SPEED_FROM_LEVEL));
  const stage = createStage(knobsForLevel(level), { width: 393, height: 640 }, undefined, 7919 * k + 31337, { unlocked: recipesForLevel(level) });
  const qs = speedQuestions(stage.questions, stage.scene.seed);
  if (qs.length === SPEED_QUESTIONS) full++;
  places[stage.scene.recipeId] = (places[stage.scene.recipeId] ?? 0) + 1;
  const asks = new Set<string>();
  for (const s of qs) {
    asked++;
    if (s.yes) yes++;
    const q = stage.questions.find((x) => x.id === s.id);
    if (!q) {
      fail(`${stage.scene.id}: "${s.prompt}" isn't one of the picture's questions`);
      continue;
    }
    const answer = q.options[q.answerIndex];
    if (s.guess !== undefined) {
      if (!q.options.includes(s.guess)) fail(`${stage.scene.id}: "${s.prompt} ${s.guess}?" isn't one of its options`);
      if ((s.guess === answer) !== s.yes) fail(`${stage.scene.id}: "${s.prompt} ${s.guess}?" says ${s.yes ? 'Yes' : 'No'}, the answer was ${answer}`);
    } else if (s.yes !== (answer === 'Yes' || answer === 'True')) fail(`${stage.scene.id}: "${s.prompt}" says ${s.yes ? 'Yes' : 'No'}, the answer was ${answer}`);
    const key = `${q.subject ?? q.id}|${q.type}`;
    if (asks.has(key)) fail(`${stage.scene.id}: two questions about ${key}`);
    asks.add(key);
  }
}
// The app tries up to four pictures for a full round, so one in 30 falling short is plenty.
if (full / PICTURES < 0.97) fail(`only ${full} of ${PICTURES} pictures have ${SPEED_QUESTIONS} quick questions`);
if (Math.abs(yes / asked - 0.5) > 0.03) fail(`${Math.round((100 * yes) / asked)}% of answers are Yes`);
console.log(`  ${full} of ${PICTURES} pictures make a full round; ${Math.round((100 * yes) / asked)}% Yes; places: ${Object.keys(places).length}`);

// When it comes.
const at = (i: number) => new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString();
const levels = (n: number, from = 0): RoundResult[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${from + i}`, playedAt: at(from + i), mode: 'levels', ladder: { level: 6 } }) as unknown as RoundResult);
const gapFirst = speedGap('first');
check('not before Level 5', speedDue(speedCounterOf(levels(10)), 4), false);
check('after the first gap of rounds', [speedDue(speedCounterOf(levels(gapFirst - 1)), 6), speedDue(speedCounterOf(levels(gapFirst)), 6)], [false, true]);
const speed = { id: 'speedy', playedAt: at(50), mode: 'levels', speed: true } as unknown as RoundResult;
const after = [...levels(10), speed, ...levels(3, 60)];
check('counts from the last speed round', speedCounterOf(after), { since: 3, gap: speedGap('speedy') });
const skipped = { id: 'not-now', playedAt: at(90), mode: 'levels', speed: true, skipped: true } as unknown as RoundResult;
check('"Not now" starts the count again', speedCounterOf([...after, skipped]), { since: 0, gap: speedGap('not-now') });
const replay = { ...levels(1, 70)[0], replay: true } as RoundResult;
const practice = { ...levels(1, 80)[0], mode: 'easy' } as unknown as RoundResult;
check('replays and Practice never count', speedCounterOf([speed, replay, practice]).since, 0);
const gaps = new Set(Array.from({ length: 200 }, (_, i) => speedGap(`id${i}`)));
check('gaps are 4, 5 and 6', [...gaps].sort(), [4, 5, 6]);

// What it wins (Level 1: 100 points an answer).
const room = { peeks: false, fifty: false };
check('8 of 8', speedPrize(8, 1, room), { right: 8, peeks: 1, fifty: 1, bonus: 200, points: 600 });
check('7 of 8', speedPrize(7, 1, room), { right: 7, peeks: 1, fifty: 0, bonus: 200, points: 550 });
check('6 of 8', speedPrize(6, 1, room), { right: 6, peeks: 0, fifty: 0, bonus: 200, points: 500 });
check('5 of 8', speedPrize(5, 1, room), { right: 5, peeks: 0, fifty: 0, bonus: 0, points: 250 });
check('no room: points instead', speedPrize(8, 1, { peeks: true, fifty: true }), { right: 8, peeks: 0, fifty: 0, bonus: 600, points: 1000 });

// 50:50s and Peeks won, from saved rounds.
const won = (fifty: number, peeks = 0) => ({ points: 0, speed: true, bonus: { fifty, peeks } }) as unknown as RoundResult;
const used = { points: 0, fifty: true } as unknown as RoundResult;
check('a 50:50 won', fiftyOf([won(1)]), 1);
check('spent', fiftyOf([won(1), used]), 0);
check(`never more than ${MAX_FIFTY}`, fiftyOf([won(1), won(1), won(1)]), MAX_FIFTY);
check('never below 0', fiftyOf([used]), 0);
check('a Peek won', walletOf([won(0, 1)]).peeks, 1);
const q4 = { id: 'beach-x-colour-kite', options: ['Red', 'Blue', 'Green', 'Pink'], answerIndex: 2 };
const hidden = fiftyHidden(q4);
check('takes away two wrong answers of four', [hidden.length, hidden.includes(2)], [2, false]);
check('one of three', fiftyHidden({ ...q4, options: ['Red', 'Blue', 'Green'] }).length, 1);
check('none of two', fiftyHidden({ ...q4, options: ['Yes', 'No'], answerIndex: 0 }).length, 0);
check('the same each time', fiftyHidden(q4), hidden);

console.log(failed ? `✗ speed: ${failed} problem(s)` : '✓ speed: quick questions true to the picture, timing, prizes and 50:50s');
if (failed) process.exit(1);
