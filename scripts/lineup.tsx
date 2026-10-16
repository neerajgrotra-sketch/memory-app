/**
 * Draws a recipe's things standing on one ground line at their real in-game sizes, to check sizes
 * against each other and spot odd shapes before reviewing whole pictures. Writes lineup.html.
 *
 *   RECIPE=farm npm run lineup                         # every thing in the recipe
 *   RECIPE=farm KINDS=farmer,wheelbarrow,cow npm run lineup
 */
import { writeFileSync } from 'fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { shade } from '@/scenes/contrast';
import { getRecipe } from '@/scenes/recipes';

const recipe = getRecipe(process.env.RECIPE ?? 'farm');
const kinds = process.env.KINDS?.split(',') ?? recipe.items.map((i) => i.kind);
const W = 900; let x = 20; const base = 260;
const parts = kinds.map((k: string) => {
  const it = recipe.items.find((i) => i.kind === k)!;
  const w = it.size * W; const h = w * (it.h / it.w); const s = w / it.w;
  const colour = it.colours ? it.colours[0].hex : it.tone!;
  const el = `<g transform="translate(${x} ${base - h}) scale(${s})" stroke="${shade(colour, 0.5)}" stroke-width="${2.5 / s}">${renderToStaticMarkup(it.draw(colour))}</g><text x="${x}" y="${base + 22}" font-size="14" fill="#ddd">${k} ${it.size}</text>`;
  x += w + 30; return el;
});
writeFileSync(process.env.OUT ?? 'lineup.html', `<!doctype html><body style="margin:0;background:#2aa3d8"><svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="300"><line x1="0" y1="${base}" x2="${x}" y2="${base}" stroke="#355" stroke-width="2"/>${parts.join('')}</svg></body>`);
