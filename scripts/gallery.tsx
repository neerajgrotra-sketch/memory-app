/**
 * Renders generated pictures to gallery.html (open it in a browser) for reviewing by eye: every setting
 * on iPhone SE, 15 and Pro Max picture sizes, with the layout overlay unless OVERLAY=0.
 *
 *   npm run gallery                                   # hard pictures, 2 per setting and phone
 *   RECIPES=city LEVEL=medium N=4 OVERLAY=0 npm run gallery
 *   SEEDS="977 3908" RECIPES=city npm run gallery     # exact pictures, e.g. from the scene checker
 */
import { writeFileSync } from 'fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { LEVELS } from '@/game/difficulty';
import { generateScene } from '@/scenes/generateScene';
import { RECIPES } from '@/scenes/recipes';
import { SceneContent } from '@/scenes/SceneView';
import { SCENE_WIDTH, ratioOf } from '@/scenes/types';
import { validateScene } from '@/scenes/validateScene';

const PHONES = [
  { name: 'iPhone SE', size: { width: 375, height: 667 - 20 - 72 } },
  { name: 'iPhone 15', size: { width: 393, height: 852 - 59 - 34 - 72 } },
  { name: 'iPhone Pro Max', size: { width: 430, height: 932 - 59 - 34 - 72 } },
];
const recipes = process.env.RECIPES ? RECIPES.filter((r) => process.env.RECIPES!.split(',').includes(r.id)) : RECIPES;
const level = (process.env.LEVEL ?? 'hard') as keyof typeof LEVELS;
const overlay = process.env.OVERLAY !== '0';
const seeds = process.env.SEEDS?.split(' ').map(Number) ?? Array.from({ length: Number(process.env.N ?? 2) }, (_, k) => (k + 1) * 104729);

const cells: string[] = [];
for (const recipe of recipes) {
  for (const seed of seeds) {
    for (const phone of PHONES) {
      const spec = generateScene(recipe, LEVELS[level], seed, phone.size);
      const issues = validateScene(spec, phone.size.width, phone.size.height);
      // Each picture is rendered on its own, so React's ids repeat between them: give each picture its
      // own, or one picture's masks and gradients would be used by another on the same page.
      const svg = renderToStaticMarkup(
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_WIDTH * ratioOf(phone.size)}`} width={phone.size.width} height={phone.size.height}>
          <SceneContent spec={spec} pointsPerUnit={phone.size.width / SCENE_WIDTH} overlay={overlay} />
        </svg>,
      ).replace(/\bs(«|R|_)/g, `p${cells.length}$1`);
      const label = `${recipe.title} · ${level} · seed ${seed} · ${phone.name} · ${issues.length ? '✗ ' + issues.map((i) => i.message).join('; ') : '✓'}`;
      cells.push(`<figure><figcaption>${label}</figcaption>${svg}</figure>`);
    }
  }
}

writeFileSync(
  'gallery.html',
  `<!doctype html><meta charset="utf-8"><title>glance gallery</title>
<style>body{margin:0;padding:12px;background:#111;color:#ddd;font:12px system-ui;display:flex;flex-wrap:wrap;gap:12px}figure{margin:0}figcaption{max-width:430px;margin-bottom:4px}</style>
${cells.join('\n')}`,
);
console.log(`Wrote gallery.html (${cells.length} pictures)`);
