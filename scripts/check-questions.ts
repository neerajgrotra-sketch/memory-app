/**
 * Checks that every question's wrong options are believable, across every place: "What was in the
 * sky…?" only offers things that can be in the sky, "Where was the dog?" only places a dog can be, no
 * option is empty, every picture still gives enough questions, and no band is named after a thing that can stand
 * in it ("Where was the campfire? Around the campfire"), and no colour question offers both red and orange. Run with
 * `npm run check:questions`.
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
    // Every question has its own id: a round, Play again and the speed round tell questions apart by it.
    const ids = qs.map((q) => q.id);
    for (const id of ids.filter((id, k) => ids.indexOf(id) !== k)) { bad++; if (bad < 6) console.log('BAD two questions with the id', id); }
    for (const q of qs) {
      optCounts[q.options.length] = (optCounts[q.options.length] ?? 0) + 1;
      // The rug ("On the carpet") is part of the ground band; only things that may go on it are offered for it.
      const rugLabel = recipe.rug?.label;
      const groundZone = recipe.zones.find((z) => z.surface === 'ground');
      const onRugOk = (o: string) => recipe.items.some((i) => !i.avoidRug && (cap(i.plural) === o || `${cap(i.article)} ${i.singular}` === o));
      if (q.template === 'anything') {
        // "Was there anything on the pond?": "No, nothing" is always offered, and every "Yes, a …" is something that
        // could be there (on the rug: something allowed on it).
        if (!q.options.includes('No, nothing')) { bad++; console.log('BAD anything: no "No, nothing"', recipe.id, q.prompt); }
        const onCarpet = !!rugLabel && q.prompt.includes(rugLabel.toLowerCase());
        const zone = recipe.zones.find((z) => q.prompt.toLowerCase().includes(z.label.toLowerCase()));
        for (const o of q.options.filter((x) => x !== 'No, nothing')) {
          const thing = cap(o.replace(/^Yes, /, ''));
          if (onCarpet ? !onRugOk(thing) : !zone || !phrase.get(thing)?.includes(zone.id)) { bad++; if (bad < 6) console.log('BAD anything', recipe.id, q.prompt, '→', o); }
        }
      } else if (q.family === 'what-here' && rugLabel && q.prompt.includes(rugLabel.toLowerCase())) {
        // "A cat and a cushion": each part must be something that can be on the rug.
        for (const o of q.options) for (const part of o.split(' and ').map(cap)) if (!onRugOk(part)) { bad++; if (bad < 6) console.log('BAD on the carpet', recipe.id, '→', o); }
      } else if (q.family === 'what-here') {
        const zone = recipe.zones.find((z) => q.prompt.toLowerCase().includes(z.label.toLowerCase()))!;
        for (const o of q.options) if (!phrase.get(o)?.includes(zone.id)) { bad++; if (bad < 6) console.log('BAD what-here', recipe.id, q.prompt, '→', o); }
      }
      if (q.family === 'where') {
        const item = recipe.items.find((i) => i.kind === q.subject)!;
        for (const o of q.options) {
          // Next to a landmark ("To the left of the table lamps"): worked out from thirds, checked in the code.
          if (o.startsWith('To the ') || o.startsWith('Between ')) continue;
          // The room's other places ("On the sofa"): always wrong, since nothing loose is put there.
          if (recipe.places?.includes(o)) {
            if (q.options[q.answerIndex] === o) { bad++; console.log('BAD where: a place nothing is put is the answer', recipe.id, q.prompt); }
            continue;
          }
          if (o === rugLabel) {
            if (item.avoidRug || !groundZone || !item.zones.includes(groundZone.id)) { bad++; if (bad < 6) console.log('BAD where (carpet)', recipe.id, q.prompt); }
            continue;
          }
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
      // Red and orange are never offered together in a colour question (testers mixed them up).
      if (q.type === 'colour') {
        const only = (c: string, o: string) => new RegExp(`\\b${c}\\b`, 'i').test(o) && !new RegExp(`\\b${c === 'Red' ? 'Orange' : 'Red'}\\b`, 'i').test(o);
        if (q.options.some((o) => only('Red', o)) && q.options.some((o) => only('Orange', o))) { bad++; if (bad < 6) console.log('RED AND ORANGE', recipe.id, q.prompt, q.options); }
      }
      if (q.options.some((o) => o === undefined || o === '')) { bad++; console.log('EMPTY option', q.prompt); }
    }
  }
}
if (process.env.SHOW_SAMPLES) console.log(samples.join('\n'));
console.log(`  above/below: ${relation}, naming where: ${named}, with an option that can't be there: ${outOfBand}`);
// A round asks 5; 10 leaves room for variety. (Places that only ask "where" by places and landmarks, never left /
// middle / right, can have 11 in a thin easy picture; the game never shows one: under 12 it tries the next seed.)
if (minPool < 10) { bad++; console.log('a picture gave fewer than 10 questions'); }
console.log(bad ? '✗' : '✓', 'bad options:', bad, '| options per question:', JSON.stringify(optCounts), '| questions per picture: avg', (total / pictures).toFixed(1), 'min', minPool);
if (bad) process.exit(1);
