/**
 * Generates thousands of scenes for every recipe, level and screen shape and checks
 * the placement rules. Run with `npm run check:scenes`; exits non-zero on any failure.
 */
import { LEVELS } from '@/game/difficulty';
import { generateQuestions } from '@/scenes/generateQuestions';
import { generateScene } from '@/scenes/generateScene';
import { RECIPES } from '@/scenes/recipes';

/** The ✕ button and countdown cover roughly the top 11% of the screen. */
const CONTROLS = 0.11;
const SCENES_PER_CASE = 300;
const MIN_QUESTIONS = 12;

let failed = false;

for (const height of [1350, 1600, 2000]) {
  for (const recipe of RECIPES) {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const knobs = LEVELS[level];
      const problems = new Set<string>();
      const placed = new Set<string>();

      for (let n = 1; n <= SCENES_PER_CASE; n++) {
        const scene = generateScene(recipe, knobs, n * 7919, height);
        if (scene.groups.length < knobs.groups) problems.add(`only ${scene.groups.length} of ${knobs.groups} kinds placed`);
        if (generateQuestions(scene, recipe, knobs).length < MIN_QUESTIONS) problems.add('too few questions');

        const rects = scene.groups.flatMap((group) => {
          const item = recipe.items.find((i) => i.kind === group.kind)!;
          const zone = recipe.zones.find((z) => z.id === group.zoneId)!;
          placed.add(group.kind);
          return group.boxes.map((b) => ({ kind: group.kind, zone, x0: b.x, y0: b.y, x1: b.x + item.w * b.scale, y1: b.y + item.h * b.scale }));
        });

        for (const r of rects) {
          if (r.x0 < 0 || r.x1 > 900) problems.add(`${r.kind} off the side of the picture`);
          if (r.y0 < CONTROLS * height) problems.add(`${r.kind} under the on-screen controls`);
          if (r.y0 < r.zone.top * height - 1 || r.y1 > r.zone.bottom * height + 1) problems.add(`${r.kind} outside its band`);
          if (r.zone.panels && !r.zone.panels.some(([p0, p1]) => r.x0 >= p0 && r.x1 <= p1)) problems.add(`${r.kind} crosses a building edge`);
          if (r.zone.surface === 'ground' && r.y1 < (r.zone.floor ?? r.zone.top) * height - 1) problems.add(`${r.kind} not standing on the floor`);
        }
        for (let a = 0; a < rects.length; a++) {
          for (let b = a + 1; b < rects.length; b++) {
            const p = rects[a];
            const q = rects[b];
            if (Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0) > 2 && Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0) > 2) {
              problems.add(p.kind === q.kind ? `two ${p.kind}s overlap` : `${p.kind} overlaps ${q.kind}`);
            }
          }
        }
      }

      for (const item of recipe.items) if (!placed.has(item.kind)) problems.add(`${item.kind} never fits anywhere`);
      const label = `${recipe.id} / ${level} / height ${height}`;
      if (problems.size) {
        failed = true;
        console.log(`✗ ${label}: ${[...problems].join('; ')}`);
      } else {
        console.log(`✓ ${label}`);
      }
    }
  }
}

process.exit(failed ? 1 : 0);
