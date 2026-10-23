/**
 * Checks the journey (src/games/lookRemember/journey.ts): a stop for every level, each place at the level it unlocks
 * with a line of story, the levels between as challenges with something new, the final boss last; and every place's
 * postcard (src/components/GameArt.tsx) picked and inside its picture. Run with `npm run check:journey`.
 */
import { POSTCARD_PLACES, placePostcard, placeThumb } from '@/components/GameArt';
import { JOURNEY, stopAt } from '@/games/lookRemember/journey';
import { BOSSES, MAX_LEVEL, RECIPE_UNLOCKS } from '@/games/lookRemember/ladder';
import { RECIPES } from '@/scenes/recipes';

let failed = 0;
const fail = (message: string) => {
  failed++;
  console.log('✗', message);
};

if (JOURNEY.length !== MAX_LEVEL) fail(`${JOURNEY.length} stops for ${MAX_LEVEL} levels`);
JOURNEY.forEach((s, i) => {
  if (s.level !== i + 1) fail(`stop ${i + 1} says Level ${s.level}`);
  if (!s.title || !s.story || s.story.includes('undefined')) fail(`Level ${s.level}: no title or story`);
  if (s.level > 1 && !s.news.length) fail(`Level ${s.level}: brings nothing to tell`);
  if (s.news.some((n) => n.startsWith('Each right answer'))) fail(`Level ${s.level}: the points line is in its news`);
  const unlock = RECIPE_UNLOCKS.find((r) => r.level === s.level);
  const want = s.level === 1 ? 'start' : unlock ? 'place' : s.level === MAX_LEVEL ? 'boss' : 'challenge';
  if (s.kind !== want) fail(`Level ${s.level}: a ${s.kind} stop, should be ${want}`);
  if (unlock && s.recipeId !== unlock.recipeId) fail(`Level ${s.level}: in ${s.recipeId}, but it unlocks ${unlock.recipeId}`);
  if (BOSSES.some((b) => b.level === s.level) !== !!s.boss) fail(`Level ${s.level}: its boss is missing or extra`);
  if (s.boss && s.recipeId !== s.boss.recipeId) fail(`Level ${s.level}: shows ${s.recipeId}, but its boss is at ${s.boss.recipeId}`);
});
const stories = JOURNEY.filter((s) => s.kind === 'place' || s.kind === 'start').map((s) => s.story);
if (new Set(stories).size !== stories.length) fail('two places share a story');
if (stopAt(0).level !== 1 || stopAt(99).level !== MAX_LEVEL) fail('stopAt goes outside the journey');

// Postcards: one for every place, inside its picture (the slice never runs past the bottom).
const RATIO = 511 / 393;
for (const r of RECIPES) {
  if (!POSTCARD_PLACES.includes(r.id)) fail(`${r.id} has no postcard`);
  for (const [name, art] of [['postcard', placePostcard(r.id)], ['thumbnail', placeThumb(r.id)]] as const) {
    const share = 1 / art.aspect / RATIO;
    if (art.recipeId !== r.id) fail(`${r.id}: its ${name} is of ${art.recipeId}`);
    if (art.focus < 0 || art.focus + share > 1 + 1e-9) fail(`${r.id}: its ${name} runs outside the picture (from ${art.focus.toFixed(2)}, ${share.toFixed(2)} tall)`);
  }
}

console.log(failed ? `✗ journey: ${failed} problem(s)` : `✓ journey: ${JOURNEY.length} stops, ${stories.length} places with a story and a postcard`);
if (failed) process.exit(1);
