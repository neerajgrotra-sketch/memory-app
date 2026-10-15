/**
 * Generates thousands of scenes for every recipe and level on three iPhone sizes and checks them
 * with `validateScene`, plus the rules that hold for every scene (size tiers, colours that can
 * show). Also lays each scene out again for the other sizes to check the facts never change.
 * Run with `npm run check:scenes`; exits non-zero on any failure.
 */
import { LEVELS } from '@/game/difficulty';
import { standsOut } from '@/scenes/contrast';
import { generateQuestions } from '@/scenes/generateQuestions';
import { generateScene, relayoutScene } from '@/scenes/generateScene';
import { RECIPES } from '@/scenes/recipes';
import { facade } from '@/scenes/recipes/city';
import { gapBetween } from '@/scenes/layout';
import { TIERS, type SceneSize } from '@/scenes/types';
import { validateScene } from '@/scenes/validateScene';

const SCENES_PER_CASE = Number(process.env.SCENES ?? 200);
const MIN_QUESTIONS = 12;

/** The picture area (below the 72 pt header, inside the safe area) on three iPhones. */
export const PHONES: { name: string; size: SceneSize }[] = [
  { name: 'iPhone SE 375×667', size: { width: 375, height: 667 - 20 - 72 } },
  { name: 'iPhone 15 393×852', size: { width: 393, height: 852 - 59 - 34 - 72 } },
  { name: 'iPhone Pro Max 430×932', size: { width: 430, height: 932 - 59 - 34 - 72 } },
];

let failed = false;
const fail = (msg: string) => {
  failed = true;
  console.log(`✗ ${msg}`);
};

// Rules for every item: a size inside its tier, something to check contrast with, a colour that can show somewhere.
for (const recipe of RECIPES) {
  for (const item of recipe.items) {
    const [lo, hi] = TIERS[item.tier];
    if (item.size < lo || item.size > hi) fail(`${recipe.id}: ${item.kind} size ${item.size} outside ${item.tier} ${lo}–${hi}`);
    if (!item.colours && !item.tone) fail(`${recipe.id}: ${item.kind} has no tone to check contrast with`);
    const surfaces = item.zones.flatMap((z) => {
      const zone = recipe.zones.find((x) => x.id === z)!;
      return [0.2, 0.5, 0.8].map((x) => recipe.surfaceAt(x, (zone.top + zone.bottom) / 2));
    });
    const colours = item.colours?.map((c) => c.hex) ?? [item.tone!];
    const shows = recipe.variants.some((v) => colours.some((c) => surfaces.some((s) => standsOut(c, v.palette[s]))));
    if (!shows) fail(`${recipe.id}: ${item.kind} can't stand out anywhere`);
  }
}

// The city's building fronts: windows and doors never overlap each other or leave their building.
for (const i of [0, 1, 2]) {
  const f = facade(i);
  const parts = [...f.windows, f.door];
  parts.forEach((a, j) => {
    if (a.x0 < i / 3 || a.x1 > (i + 1) / 3) fail(`city: building ${i} has a window or door past its edge`);
    parts.slice(j + 1).forEach((b) => {
      if (gapBetween(a, b) < 0.01) fail(`city: building ${i} has a door and window overlapping`);
    });
  });
}

const started = Date.now();
let scenes = 0;
let slowest = 0;
for (const phone of PHONES) {
  for (const recipe of RECIPES) {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const knobs = LEVELS[level];
      const problems = new Map<string, number>();
      const note = (msg: string) => problems.set(msg, (problems.get(msg) ?? 0) + 1);
      const placed = new Set<string>();
      let short = 0;
      let veryShort = 0;
      let fewQuestions = 0;

      for (let n = 1; n <= SCENES_PER_CASE; n++) {
        const t0 = Date.now();
        const scene = generateScene(recipe, knobs, n * 7919, phone.size);
        slowest = Math.max(slowest, Date.now() - t0);
        scenes++;
        for (const issue of validateScene(scene, phone.size.width, phone.size.height)) note(`${issue.rule}: ${issue.message}`);
        scene.groups.forEach((g) => placed.add(g.kind));
        if (scene.groups.length < knobs.groups - 2) note(`only ${scene.groups.length} of ${knobs.groups} kinds placed`);
        if (scene.groups.length < knobs.groups) short++;
        if (scene.groups.length < knobs.groups - 1) veryShort++;
        // createStage quietly replaces a picture with too few questions, so only flag it if that's common.
        if (generateQuestions(scene, recipe, knobs).length < MIN_QUESTIONS) fewQuestions++;

        // Laid out again for another phone: same facts, or keep the original layout (never different facts).
        if (n % 10 === 0) {
          for (const other of PHONES) {
            if (other === phone) continue;
            const again = relayoutScene(scene, other.size);
            if (!again) continue;
            // Spread groups (lamps along a pavement) have no side to ask about, so their side isn't a fact.
            const spreadOut = (g: (typeof scene.groups)[number]) => recipe.items.find((i) => i.kind === g.kind)!.spread && g.count > 1;
            const facts = (s: typeof scene) => JSON.stringify(s.groups.map((g) => [g.kind, g.count, g.colour?.name, g.zoneId, spreadOut(g) ? '' : g.region]));
            if (facts(again) !== facts(scene)) note('laying out again changed the facts');
            if (validateScene(again, other.size.width, other.size.height).length) note('laid out again but not valid');
          }
        }
      }

      if (fewQuestions / SCENES_PER_CASE > 0.1) note(`${fewQuestions} pictures with too few questions`);
      if (veryShort / SCENES_PER_CASE > 0.02) note(`${veryShort} pictures two kinds short`);
      if (short / SCENES_PER_CASE > 0.2) note(`${Math.round((100 * short) / SCENES_PER_CASE)}% of pictures one kind short`);
      for (const item of recipe.items) if (!placed.has(item.kind)) note(`${item.kind} never fits anywhere`);
      const label = `${phone.name} / ${recipe.id} / ${level}`;
      if (problems.size) fail(`${label}: ${[...problems].map(([m, c]) => `${m} (×${c})`).join('; ')}`);
      else console.log(`✓ ${label}`);
    }
  }
}

console.log(`${scenes} scenes in ${((Date.now() - started) / 1000).toFixed(1)} s (slowest ${slowest} ms)`);
process.exit(failed ? 1 : 0);
