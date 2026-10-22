/**
 * Generates thousands of scenes for every recipe and level on three iPhone sizes and checks them
 * with `validateScene`, plus the rules that hold for every scene (size tiers, colours that can
 * show). Also lays each scene out again for the other sizes to check the facts never change.
 * Run with `npm run check:scenes`; exits non-zero on any failure.
 */
import { LEVELS, type LevelConfig } from '@/game/difficulty';
import { FIRST_STATE, MAX_LEVEL, applyRound, knobsForLevel, recipesForLevel } from '@/games/lookRemember/ladder';
import { pointsFor } from '@/games/lookRemember/points';
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
for (const recipe of RECIPES.filter((r) => !process.env.ONLY || r.id === process.env.ONLY)) {
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
  const parts = [...f.windows, f.door, f.plaque];
  parts.forEach((a, j) => {
    if (a.x0 < i / 3 || a.x1 > (i + 1) / 3) fail(`city: building ${i} has a window or door past its edge`);
    parts.slice(j + 1).forEach((b) => {
      if (gapBetween(a, b) < 0.005) fail(`city: building ${i} has a door, window or number overlapping`);
    });
  });
}

// Levels: the rules for moving up and down, and that every level's knobs are ones the pictures can meet.
{
  let state = FIRST_STATE;
  for (let i = 0; i < 3; i++) state = applyRound(state, 4, 5);
  if (state.level !== 2 || state.progress !== 0) fail('levels: 3 good rounds should take you to level 2');
  state = applyRound(state, 1, 5);
  if (state.level !== 2) fail('levels: one poor round should not drop a level');
  state = applyRound(state, 3, 5);
  state = applyRound(state, 0, 5);
  if (state.level !== 2) fail('levels: an average round should break a run of poor rounds');
  state = applyRound(state, 0, 5);
  if (state.level !== 1 || state.best !== 2) fail('levels: 2 poor rounds in a row should drop one level and keep the best');
  if (applyRound(FIRST_STATE, 0, 5).level !== 1 || applyRound(applyRound(FIRST_STATE, 0, 5), 0, 5).level !== 1) fail('levels: never below 1');
  let top = { ...FIRST_STATE, level: MAX_LEVEL, best: MAX_LEVEL };
  top = applyRound(top, 5, 5);
  if (top.level !== MAX_LEVEL) fail('levels: never above the top');
  let previous: LevelConfig | null = null;
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const k = knobsForLevel(level);
    if (k.groups > LEVELS.hard.groups || k.maxCount > LEVELS.hard.maxCount) fail(`levels: level ${level} asks for more than Hard`);
    if (previous && (k.groups < previous.groups || k.viewSeconds > previous.viewSeconds || k.maxCount < previous.maxCount)) {
      fail(`levels: level ${level} is easier than level ${level - 1}`);
    }
    previous = k;
  }
  const p = pointsFor({ correct: [true, true, false, true, true], level: 1, viewSeconds: 10, lookedSeconds: 6.5 });
  if (p.answers !== 400 || p.streak !== 40 || p.ready !== 60 || p.total !== 500) fail(`points: unexpected ${JSON.stringify(p)}`);
  if (pointsFor({ correct: [true], level: 1, viewSeconds: 10, lookedSeconds: 10 }).ready !== 0) fail('points: no bonus when the time ran out');
  console.log(failed ? '✗ levels and points' : '✓ levels and points');
}

/** Practice bands, plus levels where the knobs change, for the settings each level has reached. */
const CASES: { label: string; knobs: LevelConfig; recipes?: string[] }[] = [
  ...(['easy', 'medium', 'hard'] as const).map((level) => ({ label: level, knobs: LEVELS[level] })),
  ...[1, 3, 4, 6, 8, 10, 13, 15, 17, 30].map((level) => ({ label: `level ${level}`, knobs: knobsForLevel(level), recipes: recipesForLevel(level) })),
];

const started = Date.now();
let scenes = 0;
let slowest = 0;
for (const phone of PHONES) {
  for (const recipe of RECIPES.filter((r) => !process.env.ONLY || r.id === process.env.ONLY)) {
    for (const { label: level, knobs, recipes } of CASES) {
      if (recipes && !recipes.includes(recipe.id)) continue;
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
        // The recipe's hard rule (each zoo animal in its own habitat) holds for every group.
        const breaksFits = (s: typeof scene) =>
          recipe.fits && s.groups.some((g) => !recipe.fits!(recipe.items.find((i) => i.kind === g.kind)!, g.zoneId, g.slot.col, s.details));
        if (breaksFits(scene)) note('a thing is somewhere its recipe says it may not be (fits)');
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
            const facts = (s: typeof scene) => JSON.stringify(s.groups.map((g) => [g.kind, g.count, g.colour?.name, g.colours?.map((c) => c.name).join('+'), g.zoneId, spreadOut(g) ? '' : g.region]));
            if (facts(again) !== facts(scene)) note('laying out again changed the facts');
            if (validateScene(again, other.size.width, other.size.height).length) note('laid out again but not valid');
            if (breaksFits(again)) note('laid out again with a thing where its recipe says it may not be (fits)');
          }
        }
      }

      if (fewQuestions / SCENES_PER_CASE > 0.1) note(`${fewQuestions} pictures with too few questions`);
      if (veryShort / SCENES_PER_CASE > 0.02) note(`${veryShort} pictures two kinds short`);
      if (short / SCENES_PER_CASE > 0.2) note(`${Math.round((100 * short) / SCENES_PER_CASE)}% of pictures one kind short`);
      // Small pictures (few kinds) may never pick some things; the check is that every thing fits somewhere.
      if (!recipes) for (const item of recipe.items) if (!placed.has(item.kind)) note(`${item.kind} never fits anywhere`);
      const label = `${phone.name} / ${recipe.id} / ${level}`;
      if (problems.size) fail(`${label}: ${[...problems].map(([m, c]) => `${m} (×${c})`).join('; ')}`);
      else console.log(`✓ ${label}`);
    }
  }
}

console.log(`${scenes} scenes in ${((Date.now() - started) / 1000).toFixed(1)} s (slowest ${slowest} ms)`);
process.exit(failed ? 1 : 0);
