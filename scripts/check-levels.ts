/**
 * Checks that the 30 levels feel like a climb with something new on each step (`knobsForLevel` in
 * src/games/lookRemember/ladder.ts), playing generated pictures and rounds the way the app deals them:
 *
 * - every level brings something new besides points (`unlocksAt`), apart from `LEVELS_TO_FILL`;
 * - no level is easier than the one before: the seconds of looking per thing in the picture never go up;
 * - no level is a cliff: the share of hard questions (where, above / below, details) never jumps by more than 10 points;
 * - a level never asks a kind of question before it's brought in;
 * - a 10-round session doesn't keep asking the same wording (`Question.template`): none is asked in more than about
 *   two rounds in three, or, where a level has few wordings to choose from (the beach alone at Level 1), much more than
 *   its share. At Levels 1–3, which are about what was there and colours, those two may come up in up to 7.5 of 10.
 *
 * Run with `npm run check:levels`.
 */
import { ROUND_SIZE } from '@/game/difficulty';
import { selectQuestions } from '@/game/selectQuestions';
import { LEVELS_TO_FILL, MAX_LEVEL, knobsForLevel, recipesForLevel, unlocksAt } from '@/games/lookRemember/ladder';
import { createStage } from '@/scenes/createStage';
import type { Question } from '@/types/game';

let failed = 0;
const fail = (message: string) => {
  failed++;
  console.log('✗', message);
};
const SIZE = { width: 393, height: 640 };
// Harder through richer questions, not positions (docs/question-design.md): details, what was happening, two steps and sums.
const HARD = new Set(['detail', 'story', 'two-step', 'altogether', 'difference', 'sharing']);
/** The wordings Levels 1–3 are about: what colour, and what was there. */
const CORE = new Set(['colour', 'what-here']);
const BACKBONE = new Set(['count', 'colour']);

const round = (level: number, pool: Question[], previousTemplates?: ReadonlySet<string>) => {
  const knobs = knobsForLevel(level);
  return selectQuestions(pool, { count: ROUND_SIZE, preferredTypes: knobs.preferredTypes, typeCaps: knobs.typeCaps, storyMin: knobs.storyMin, seenIds: new Set(), previousIds: new Set(), previousTemplates });
};

// Something new on every level.
for (let level = 2; level <= MAX_LEVEL; level++) {
  const news = unlocksAt(level).filter((n) => !n.startsWith('Each right answer'));
  const toFill = LEVELS_TO_FILL.includes(level);
  if (!news.length && !toFill) fail(`level ${level} brings nothing new but points`);
  if (news.length && toFill) fail(`level ${level} is in LEVELS_TO_FILL but brings: ${news.join('; ')}`);
}

// The curve, from pictures and rounds at every level.
const PICTURES = 150;
let previous: { perThing: number; hard: number } | null = null;
const rows: string[] = [];
for (let level = 1; level <= MAX_LEVEL; level++) {
  const knobs = knobsForLevel(level);
  let things = 0;
  let hard = 0;
  let asked = 0;
  for (let k = 0; k < PICTURES; k++) {
    const stage = createStage(knobs, SIZE, undefined, 7919 * k + 104729 * level, { unlocked: recipesForLevel(level) });
    things += stage.scene.groups.reduce((sum, g) => sum + g.count, 0);
    for (const q of stage.questions) if (q.family && !knobs.families?.includes(q.family)) fail(`level ${level} asks "${q.prompt}" (${q.family}) before it's brought in`);
    const picked = round(level, stage.questions);
    if (picked.length !== ROUND_SIZE) fail(`level ${level}: a round of ${picked.length} questions`);
    for (const q of picked) {
      asked++;
      if (q.family && HARD.has(q.family)) hard++;
    }
  }
  const perThing = knobs.viewSeconds / (things / PICTURES);
  const hardShare = (100 * hard) / asked;
  rows.push(`${level}:${perThing.toFixed(2)}s/${Math.round(hardShare)}%`);
  if (previous && perThing > previous.perThing * 1.05) fail(`level ${level} is easier than level ${level - 1}: ${perThing.toFixed(2)} s to look at each thing, up from ${previous.perThing.toFixed(2)}`);
  if (previous && hardShare - previous.hard > 10) fail(`level ${level} is a cliff: hard questions jump from ${Math.round(previous.hard)}% to ${Math.round(hardShare)}%`);
  previous = { perThing, hard: hardShare };
}
console.log('  per level (seconds to look at each thing / hard questions):', rows.join(' '));

// Sessions: 10 rounds in a row, each a new picture in another place, as the app deals them.
const SESSIONS = 40;
const variety: string[] = [];
for (const level of [1, 2, 4, 9, 13, 18, 23, 30]) {
  let worst = 0;
  let worstOther = 0;
  let worstCount = 0;
  let distinct = 0;
  for (let s = 0; s < SESSIONS; s++) {
    let place: string | undefined;
    let last = new Set<string>();
    const counts: Record<string, number> = {};
    for (let r = 0; r < 10; r++) {
      const stage = createStage(knobsForLevel(level), SIZE, place, 1299709 * s + 15485863 * level + 31 * r, { unlocked: recipesForLevel(level) });
      place = stage.scene.recipeId;
      const picked = round(level, stage.questions, last);
      last = new Set(picked.flatMap((q) => (q.template ? [q.template] : [])));
      for (const t of last) counts[t] = (counts[t] ?? 0) + 1;
    }
    // "How many" and "what colour" are counted on their own, with one round more allowed: from Level 11 they carry
    // the counting and colours alone ("more or fewer" and true or false have stopped), until each place has more
    // "what was happening" questions to mix in (docs/question-design.md).
    worst += Math.max(0, ...Object.entries(counts).filter(([t]) => !BACKBONE.has(t)).map(([, n]) => n));
    worstCount += Math.max(counts.count ?? 0, counts.colour ?? 0);
    worstOther += Math.max(0, ...Object.entries(counts).filter(([t]) => !CORE.has(t)).map(([, n]) => n));
    distinct += Object.keys(counts).length;
  }
  const kinds = distinct / SESSIONS;
  // 5 questions a round over 10 rounds, shared evenly between the wordings there are.
  const share = (10 * ROUND_SIZE) / kinds;
  const limit = Math.max(6.5, 1.5 * share);
  // At Levels 1–3 a round is mostly "what was there" and colours (`preferredTypes`), so those two may come up in most
  // rounds; nothing else may.
  const most = (level <= 3 ? worstOther : worst) / SESSIONS;
  const core = worst / SESSIONS;
  variety.push(`${level}: ${kinds.toFixed(1)} kinds, most ${(worst / SESSIONS).toFixed(1)}×`);
  if (most > limit) fail(`level ${level}: one wording is asked in ${most.toFixed(1)} of 10 rounds (an even share is ${share.toFixed(1)})`);
  if (worstCount / SESSIONS > limit + 1) fail(`level ${level}: "how many" or "what colour" is asked in ${(worstCount / SESSIONS).toFixed(1)} of 10 rounds`);
  if (level <= 3 && core > 7.5) fail(`level ${level}: "what colour" or "what was there" is asked in ${core.toFixed(1)} of 10 rounds`);
}
console.log('  10-round sessions (different wordings asked, most-asked one):', variety.join(' · '));

console.log(failed ? `✗ levels: ${failed} problem(s)` : '✓ levels: something new on every level, no dips, no cliffs, varied sessions');
if (failed) process.exit(1);
