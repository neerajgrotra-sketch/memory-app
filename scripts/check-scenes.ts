/**
 * Generates thousands of scenes for every recipe, level and screen shape and checks
 * the placement rules. Run with `npm run check:scenes`; exits non-zero on any failure.
 */
import { LEVELS } from '@/game/difficulty';
import { generateQuestions } from '@/scenes/generateQuestions';
import { MIN_VISIBLE, THIRD_MARGIN, THIRDS, TOP_MARGIN, generateScene, regionOf, zoneScale } from '@/scenes/generateScene';
import { RECIPES } from '@/scenes/recipes';

const SCENES_PER_CASE = 300;
const MIN_QUESTIONS = 12;

let failed = false;

for (const height of [1350, 1600, 2000]) {
  for (const recipe of RECIPES) {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const knobs = LEVELS[level];
      const problems = new Set<string>();
      const placed = new Set<string>();
      let short = 0;
      let veryShort = 0;

      for (let n = 1; n <= SCENES_PER_CASE; n++) {
        const scene = generateScene(recipe, knobs, n * 7919, height);
        // At real sizes a crowded picture may have room for a kind or two fewer: one short now and then,
        // two short very rarely, never more.
        if (scene.groups.length < knobs.groups - 2) problems.add(`only ${scene.groups.length} of ${knobs.groups} kinds placed`);
        if (scene.groups.length < knobs.groups) short++;
        if (scene.groups.length < knobs.groups - 1) veryShort++;
        if (generateQuestions(scene, recipe, knobs).length < MIN_QUESTIONS) problems.add('too few questions');

        const rects = scene.groups.flatMap((group) => {
          const item = recipe.items.find((i) => i.kind === group.kind)!;
          const zone = recipe.zones.find((z) => z.id === group.zoneId)!;
          placed.add(group.kind);
          if (group.count > item.maxCount) problems.add(`more ${item.plural} than is realistic`);
          const boxes = group.boxes.map((b) => ({ kind: group.kind, zone, x0: b.x, y0: b.y, x1: b.x + item.w * b.scale, y1: b.y + item.h * b.scale }));
          const centre = (Math.min(...boxes.map((b) => b.x0)) + Math.max(...boxes.map((b) => b.x1))) / 2;
          if (regionOf(centre) !== group.region) problems.add(`${group.kind} answer says ${group.region} but it is not`);
          if (Math.abs(centre - THIRDS[0]) < THIRD_MARGIN - 25 || Math.abs(centre - THIRDS[1]) < THIRD_MARGIN - 25) problems.add(`${group.kind} on the line between two sides`);
          return boxes;
        });

        for (const zone of recipe.zones) {
          if ((zone.minGroups ?? 0) > scene.groups.filter((g) => g.zoneId === zone.id).length) problems.add(`${zone.id} left bare`);
        }

        // Placement habits: hanging heights, wall gaps, windows and doors, rugs, mounting points.
        const fixtures = recipe.fixtures?.(height) ?? [];
        const mounts = recipe.mounts?.(height) ?? [];
        for (const group of scene.groups) {
          const item = recipe.items.find((i) => i.kind === group.kind)!;
          const zone = recipe.zones.find((z) => z.id === group.zoneId)!;
          const pxPerCm = zoneScale(recipe, zone, height);
          for (const b of group.boxes) {
            const w = item.w * b.scale;
            const h = item.h * b.scale;
            const r = { x0: b.x, y0: b.y, x1: b.x + w, y1: b.y + h };
            if (zone.surface === 'wall') {
              for (const f of fixtures) {
                if (f.kind === 'opening' && r.x0 < f.x1 && f.x0 < r.x1 && r.y0 < f.y1 && f.y0 < r.y1) problems.add(`${item.kind} covers a window or door`);
              }
            }
            if (item.hangAt) {
              const centreCm = ((zone.plane ?? zone.bottom) * height - (r.y0 + r.y1) / 2) / pxPerCm;
              if (centreCm < item.hangAt[0] - 1 || centreCm > item.hangAt[1] + 1) problems.add(`${item.kind} hung at the wrong height`);
            }
            if (item.avoid?.includes('rug')) {
              for (const f of fixtures) {
                if (f.kind !== 'rug') continue;
                if (r.x0 < f.cx + f.rx && f.cx - f.rx < r.x1 && r.y0 < f.cy + f.ry && f.cy - f.ry < r.y1) problems.add(`${item.kind} over the rug`);
              }
            }
            if (item.mount === 'corner') {
              const ok = mounts.some((m) => m.kind === 'corner' && Math.abs((r.y0 + r.y1) / 2 - m.y) < 1 && (m.side === 'left' ? Math.abs(r.x0 - m.x) < 1 : Math.abs(r.x1 - m.x) < 1));
              if (!ok) problems.add(`${item.kind} not fixed to a building corner`);
            }
            if (item.mount === 'roof') {
              const ok = mounts.some((m) => m.kind === 'roof' && Math.abs(r.y1 - m.y) < 1 && r.x0 >= m.x0 - 1 && r.x1 <= m.x1 + 1);
              if (!ok) problems.add(`${item.kind} not standing on a roof`);
            }
          }
        }
        if (recipe.wallGapCm) {
          const hung = scene.groups.filter((g) => recipe.zones.find((z) => z.id === g.zoneId)!.surface === 'wall');
          for (let a = 0; a < hung.length; a++) {
            for (let b = a + 1; b < hung.length; b++) {
              const zone = recipe.zones.find((z) => z.id === hung[a].zoneId)!;
              const gap = recipe.wallGapCm * zoneScale(recipe, zone, height) - 1;
              const box = (g: (typeof hung)[number]) => {
                const item = recipe.items.find((i) => i.kind === g.kind)!;
                return g.boxes.map((bx) => ({ x0: bx.x, y0: bx.y, x1: bx.x + item.w * bx.scale, y1: bx.y + item.h * bx.scale }));
              };
              for (const p of box(hung[a])) {
                for (const q of box(hung[b])) {
                  if (p.x0 < q.x1 + gap && q.x0 < p.x1 + gap && p.y0 < q.y1 + gap && q.y0 < p.y1 + gap) problems.add(`${hung[a].kind} too close to ${hung[b].kind} on the wall`);
                }
              }
            }
          }
        }

        for (const r of rects) {
          if (r.x0 < 0 || r.x1 > 900) problems.add(`${r.kind} off the side of the picture`);
          if (r.y0 < TOP_MARGIN * height - 1) problems.add(`${r.kind} touching the top edge`);
          if (r.y1 - r.y0 < MIN_VISIBLE - 0.5) problems.add(`${r.kind} too small to see`);
          if (r.zone.surface === 'ground') {
            if (r.y1 < r.zone.top * height - 1 || r.y1 > r.zone.bottom * height + 1) problems.add(`${r.kind} not standing in its area`);
          } else if (r.y0 < r.zone.top * height - 1 || r.y1 > r.zone.bottom * height + 1) {
            problems.add(`${r.kind} outside its band`);
          }
          if (r.zone.panels && !r.zone.panels.some(([p0, p1]) => r.x0 >= p0 && r.x1 <= p1)) problems.add(`${r.kind} crosses a building edge`);
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

      if (veryShort / SCENES_PER_CASE > 0.01) problems.add(`${veryShort} pictures two kinds short`);
      if (short / SCENES_PER_CASE > 0.15) problems.add(`${Math.round((100 * short) / SCENES_PER_CASE)}% of pictures one kind short`);
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
