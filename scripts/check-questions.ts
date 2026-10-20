/**
 * Checks that every question's wrong options are believable, across every place: "What was in the
 * sky…?" only offers things that can be in the sky, "Where was the dog?" only places a dog can be, no
 * option is empty, every picture still gives enough questions, and no band is named after a thing that can stand
 * in it ("Where was the campfire? Around the campfire"). Run with `npm run check:questions`.
 */
import { LEVELS } from '@/game/difficulty';
import { generateScene } from '@/scenes/generateScene';
import { generateQuestions } from '@/scenes/generateQuestions';
import { RECIPES } from '@/scenes/recipes';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
let relation = 0; let named = 0; let outOfBand = 0; const samples: string[] = [];
let bad = 0; const optCounts: Record<string, number> = {}; let minPool = 999; let total = 0; let pictures = 0;
for (const recipe of RECIPES) {
  for (const i of recipe.items) for (const z of recipe.zones.filter((z) => i.zones.includes(z.id)))
    if (new RegExp(`\\b(${i.singular}|${i.plural})\\b`, 'i').test(z.label)) { bad++; console.log('BAD band name', recipe.id, `"${z.label}" names ${i.singular}, which can be there`); }
  const phrase = new Map<string, string[]>();
  for (const i of recipe.items) for (const p of [cap(i.plural), `${cap(i.article)} ${i.singular}`]) phrase.set(p, i.zones);
  for (let s = 1; s <= 300; s++) {
    const lvl = (['easy', 'medium', 'hard'] as const)[s % 3];
    const scene = generateScene(recipe, LEVELS[lvl], s * 7919, { width: 393, height: 687 });
    const qs = generateQuestions(scene, recipe, LEVELS[lvl]);
    pictures++; total += qs.length; minPool = Math.min(minPool, qs.length);
    for (const q of qs) {
      optCounts[q.options.length] = (optCounts[q.options.length] ?? 0) + 1;
      if (q.family === 'what-here') {
        const zone = recipe.zones.find((z) => q.prompt.toLowerCase().includes(z.label.toLowerCase()))!;
        for (const o of q.options) if (!phrase.get(o)?.includes(zone.id)) { bad++; if (bad < 6) console.log('BAD what-here', recipe.id, q.prompt, '→', o); }
      }
      if (q.family === 'where') {
        const item = recipe.items.find((i) => i.kind === q.subject)!;
        for (const o of q.options) {
          const zone = recipe.zones.find((z) => o.startsWith(z.label))!;
          if (!item.zones.includes(zone.id)) { bad++; if (bad < 6) console.log('BAD where', recipe.id, q.prompt, '→', o); }
        }
      }
      if (q.family === 'relation') {
        // "What was in the sky, above the pumpkins?": wrong options that can't be in the sky give the answer away.
        relation++;
        const zone = recipe.zones.find((z) => q.prompt.includes(` ${z.label[0].toLowerCase()}${z.label.slice(1)}, `));
        if (zone) {
          named++;
          if (q.options.some((o) => !phrase.get(o)?.includes(zone.id))) outOfBand++;
        }
        if (samples.length < 40 && s % 37 === 0) samples.push(`${recipe.id}: ${q.prompt} → ${q.options.join(' / ')}`);
      }
      if (q.options.some((o) => o === undefined || o === '')) { bad++; console.log('EMPTY option', q.prompt); }
    }
  }
}
if (process.env.SHOW_SAMPLES) console.log(samples.join('\n'));
console.log(`  above/below: ${relation}, naming where: ${named}, with an option that can't be there: ${outOfBand}`);
if (minPool < 12) { bad++; console.log('a picture gave fewer than 12 questions'); }
console.log(bad ? '✗' : '✓', 'bad options:', bad, '| options per question:', JSON.stringify(optCounts), '| questions per picture: avg', (total / pictures).toFixed(1), 'min', minPool);
if (bad) process.exit(1);
