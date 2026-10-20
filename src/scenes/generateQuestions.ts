import type { Question, QuestionFamily } from '@/types/game';

import { ALL_COLOURS } from './colours';
import { createRng, type Rng } from './random';
import { regionOf } from './layout';
import type { ItemDef, PlacedGroup, Recipe, Region, SceneSpec, ZoneDef } from './types';

export interface QuestionKnobs {
  /** Wrong counts right next to the answer (4 vs 5) instead of further away. */
  closeCounts: boolean;
  /** Ask about the backdrop's details: house numbers and colours, the barn's colour (Medium and Hard, Level 8+). */
  houseNumbers?: boolean;
}

const REGION_PHRASE: Record<Region, string> = {
  left: 'on the left',
  centre: 'in the middle',
  right: 'on the right',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const cellLabel = (zone: ZoneDef, region: Region) => `${zone.label}, ${REGION_PHRASE[region]}`;

/** "Red and yellow", "Orange, red and yellow": a group's different colours, in a fixed order so answers match. */
const colourList = (names: string[]) => {
  const unique = [...new Set(names.map((n) => n.toLowerCase()))].sort();
  const text = unique.length === 1 ? unique[0] : `${unique.slice(0, -1).join(', ')} and ${unique.at(-1)}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Numbers easy to mix up with `n`: two digits swapped, or a few doors along. */
function numberLookalikes(n: number): string[] {
  const digits = String(n).split('');
  const swaps = digits.slice(0, -1).map((_, i) => {
    const d = [...digits];
    [d[i], d[i + 1]] = [d[i + 1], d[i]];
    return d.join('');
  });
  return [...swaps.filter((x) => !x.startsWith('0') && x !== String(n)), String(n + 2), String(n - 2), String(n + 10)];
}

/** Every way of choosing `k` of `items`. */
function combinations<T>(items: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [first, ...rest] = items;
  return [...combinations(rest, k - 1).map((c) => [first, ...c]), ...combinations(rest, k)];
}

/** True if there can be more than one of a thing (so counting it and plural answers make sense). */
const canBeSeveral = (item: ItemDef) => item.countable !== false && item.maxCount > 1;

/** "A sailboat" for one, "Sailboats" for several. */
const nounPhrase = (item: ItemDef, plural: boolean) => (plural ? cap(item.plural) : `${cap(item.article)} ${item.singular}`);

/**
 * The answer plus up to three different wrong options, the given candidates first. Only believable
 * candidates should be passed: with fewer than three, the question has fewer options (and one with
 * fewer than three options in all isn't asked; see the end of `generateQuestions`).
 */
function withDistractors(answer: string, preferred: string[], fallback: string[], rng: Rng): string[] {
  const pool = [...rng.shuffle(preferred), ...rng.shuffle(fallback)].filter((o) => o !== answer);
  return [answer, ...[...new Set(pool)].slice(0, 3)];
}

/** Colours too alike to tell apart from memory on a phone: never both offered in one question (testers mixed them up). */
const CLASHING_COLOURS: [string, string][] = [['Red', 'Orange']];
const mentions = (text: string, colour: string) => new RegExp(`\\b${colour}\\b`, 'i').test(text);
/** Whether two options, or an option and the answer, ask the player to tell clashing colours apart. */
function clashes(a: string, b: string): boolean {
  return CLASHING_COLOURS.some(([x, y]) =>
    [
      [x, y],
      [y, x],
    ].some(([p, q]) => mentions(a, p) && !mentions(a, q) && mentions(b, q) && !mentions(b, p)),
  );
}

/** `withDistractors` for colour answers: no wrong option clashes with the answer or with another option. */
function withColourDistractors(answer: string, preferred: string[], fallback: string[], rng: Rng): string[] {
  const pool = [...new Set([...rng.shuffle(preferred), ...rng.shuffle(fallback)].filter((o) => o !== answer))];
  const picked = [answer];
  for (const o of pool) if (picked.length < 4 && !picked.some((p) => clashes(p, o))) picked.push(o);
  return picked;
}

function countOptions(n: number, close: boolean, rng: Rng): string[] {
  const candidates = Array.from({ length: Math.max(6, n + 3) }, (_, i) => i + 1).filter((c) => c !== n);
  const picked = close
    ? rng.shuffle(candidates).sort((a, b) => Math.abs(a - n) - Math.abs(b - n)).slice(0, 3)
    : rng.shuffle(candidates.filter((c) => Math.abs(c - n) <= 3)).slice(0, 3);
  return [n, ...picked].map(String);
}

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** "the kites", or the part that's coloured: "the sail on the boat", "the person’s shirt". */
function colourNoun(item: ItemDef, plural: boolean): string {
  const prompt = item.colourPrompt?.(plural);
  const match = prompt?.match(/^What colours? (?:was|were) (.+)\?$/);
  return match ? match[1] : `the ${plural ? item.plural : item.singular}`;
}

/** "was" or "were" to go with `colourNoun`: from the thing's own question, so "the curtains" (one window) are plural. */
function colourVerb(item: ItemDef, plural: boolean): 'was' | 'were' {
  const match = item.colourPrompt?.(plural).match(/^What colours? (was|were) /);
  return match ? (match[1] as 'was' | 'were') : plural ? 'were' : 'was';
}

/** The named colour closest to a hex (for things with a fixed colour: a red crab, a green tree). */
function nearestColour(hex: string): string {
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(hex);
  let best = ALL_COLOURS[0];
  let bestDistance = Infinity;
  for (const c of ALL_COLOURS) {
    const [cr, cg, cb] = rgb(c.hex);
    const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (distance < bestDistance) [best, bestDistance] = [c, distance];
  }
  return best.name;
}

/** Writes every question the scene can answer. Answers come straight from the scene, so they are always right. */
export function generateQuestions(spec: SceneSpec, recipe: Recipe, knobs: QuestionKnobs): Question[] {
  const rng = createRng(spec.seed ^ 0x9e3779b9);
  const itemOf = (kind: string) => recipe.items.find((i) => i.kind === kind)!;
  const zoneOf = (id: string) => recipe.zones.find((z) => z.id === id)!;
  const present = spec.groups.map((g) => itemOf(g.kind));
  const absent = recipe.items.filter((i) => !spec.groups.some((g) => g.kind === i.kind) && !spec.details?.alsoSeen?.includes(i.kind));
  const questions: Question[] = [];
  /** Every side a group is on: one, or each side a spread group has a copy on. */
  const sidesOf = (g: PlacedGroup): Set<Region> => {
    const it = itemOf(g.kind);
    if (!(it.spread && g.count > 1)) return new Set([g.region]);
    return new Set(g.boxes.map((b) => regionOf(b.x + b.w / 2)));
  };
  // Only bands things can go in make believable wrong answers (not the room's bare ceiling).
  const zones = recipe.zones.filter((z) => z.rows > 0);

  // Thirds and bands, for questions that relate one thing to another ("above the armchair"). Thirds, not exact
  // positions: they never change when the picture is laid out again for another screen. Wide things (a sofa, a
  // bus) reach into the next third, so they're never asked about there.
  const zoneIndex = (g: PlacedGroup) => recipe.zones.findIndex((z) => z.id === g.zoneId);
  const isFlat = (z: ZoneDef) => z.flat ?? (z.surface === 'ground' && !z.flush);
  const NEXT: Record<Region, Region[]> = { left: ['centre'], centre: ['left', 'right'], right: ['centre'] };
  const isWide = (g: PlacedGroup) => itemOf(g.kind).wide === true;
  const reaches = (g: PlacedGroup, region: Region) => sidesOf(g).has(region) || (isWide(g) && NEXT[g.region].includes(region));
  // One-off things in the sky (the sun, a plane), and everything in a far-off band (space seen from the Moon), are
  // far away, not above anything: "below the sun" or "above the crater: a satellite" reads oddly.
  const faraway = (g: PlacedGroup) => zoneOf(g.zoneId).faraway === true || (itemOf(g.kind).countable === false && zoneOf(g.zoneId).surface === 'air');
  // Nothing else in its own band shares its third: in a deep band (the living room floor), a thing at the back stands
  // above one at the front, so "What was on the wall, above the crayons?" skipped the armchair players saw right
  // above them.
  const alone = (g: PlacedGroup) => !spec.groups.some((o) => o !== g && o.zoneId === g.zoneId && (reaches(o, g.region) || reaches(g, o.region)));
  /**
   * What stands against the wall in one third, below the wall band at `wallIdx`, to name as a landmark ("on the wall
   * in the middle, above the armchair"): the one thing there (furniture, a tall lamp), or one copy of a pair standing
   * apart ("the table lamp"). Things out on the floor in front don't count; they aren't below the wall. Nothing when
   * that third has none, or two (a sofa reaching across from the next one).
   */
  const backAt = (wallIdx: number) => (g: PlacedGroup) => zoneIndex(g) === wallIdx + 1 && !!(itemOf(g.kind).backRow || itemOf(g.kind).tall);
  const backLandmark = (wallIdx: number, region: Region): string | undefined => {
    const here = spec.groups.filter((g) => backAt(wallIdx)(g) && reaches(g, region));
    if (here.length !== 1) return undefined;
    const g = here[0];
    const it = itemOf(g.kind);
    if (it.spread && g.count > 1) return g.boxes.filter((b) => regionOf(b.x + b.w / 2) === region).length === 1 ? `the ${it.singular}` : undefined;
    return the(g);
  };
  const landmarkBelow = (group: PlacedGroup) => (zoneOf(group.zoneId).surface === 'wall' ? backLandmark(zoneIndex(group), group.region) : undefined);
  /**
   * "Where was the window?" for a thing on a wall, with what stood below each third: "On the wall on the right, above
   * the table lamp" / "On the wall on the left, above the television". A third with nothing against the wall is
   * named with something that wasn't there (so the answer isn't the only one with a landmark), and one more wrong
   * answer pairs the right third with the wrong thing, so both have to be remembered. Null without a landmark below.
   */
  const wallWhere = (group: PlacedGroup): { answer: string; wrong: string[] } | null => {
    const z = zoneOf(group.zoneId);
    const idx = zoneIndex(group);
    const own = landmarkBelow(group);
    if (!own || !recipe.zones[idx + 1]) return null;
    const at = (r: Region) => `${z.label} ${REGION_PHRASE[r]}`;
    // Things that could stand against this wall, never a wide one.
    const backKinds = recipe.items.filter((i) => (i.backRow || i.tall) && !i.wide && i.zones.includes(recipe.zones[idx + 1].id));
    const notIn = (r: Region) =>
      backKinds.filter((i) => !spec.groups.some((g) => g.kind === i.kind && backAt(idx)(g) && reaches(g, r)) && `the ${i.singular}` !== own);
    const wrong: string[] = [];
    for (const r of ['left', 'centre', 'right'] as Region[]) {
      if (r === group.region) continue;
      const there = backLandmark(idx, r) ?? (notIn(r).length ? `the ${rng.pick(notIn(r)).singular}` : undefined);
      if (there) wrong.push(`${at(r)}, above ${there}`);
    }
    const swap = notIn(group.region);
    if (swap.length) wrong.push(`${at(group.region)}, above the ${rng.pick(swap).singular}`);
    return wrong.length >= 2 ? { answer: `${at(group.region)}, above ${own}`, wrong } : null;
  };
  const the = (g: PlacedGroup) => `the ${g.count > 1 ? itemOf(g.kind).plural : itemOf(g.kind).singular}`;
  const COL: Record<Region, number> = { left: 0, centre: 1, right: 2 };
  /**
   * Where a thing was next to a landmark in its own band: furniture against the wall or a tall thing (a lamp, the TV,
   * a bookshelf, a plant), never a wide one (a sofa reaches into the next third). By thirds, which never change when
   * the picture is laid out again (copies of a pair keep theirs too): "To the left of the table lamps" when every
   * copy is in a third to its right, "Between the table lamps" when copies are on both sides. A landmark sharing the
   * thing's third says nothing for sure, so it's left out. One true statement is the answer; false ones about the
   * same landmark are the best wrong answers. Null when there are too few.
   */
  // Things against the back wall (furniture, tall lamps, the TV) and things out on the floor are at different depths:
  // a pile of books at the front isn't "to the left of the bookshelf" at the back, it's between the teddy bear and the
  // ball. So things are only placed next to things at their own depth; things on a rug only next to things on it.
  const standsBack = (g: PlacedGroup) => !!(itemOf(g.kind).backRow || itemOf(g.kind).tall);
  const sameDepth = (a: PlacedGroup, b: PlacedGroup) =>
    a.zoneId === b.zoneId && standsBack(a) === standsBack(b) && (a.onRug === 'all') === (b.onRug === 'all') && a.onRug !== 'some' && b.onRug !== 'some';
  const besideLandmark = (group: PlacedGroup): { answer: string; wrong: string[]; fallback: string[] } | null => {
    const at = COL[group.region];
    const colsOf = (g: PlacedGroup) => [...sidesOf(g)].map((r) => COL[r]);
    const landmarks = spec.groups.filter((g) => g !== group && sameDepth(g, group) && !isWide(g) && !colsOf(g).includes(at));
    // Every statement is believable to the eye (a thing can stand just right of a lamp in the right-hand third), so
    // all of them are offered for each landmark; truth comes from the thirds.
    type Statement = { text: string; truth: boolean; landmarks: PlacedGroup[] };
    const statements: Statement[] = landmarks.flatMap((g) => {
      const cols = colsOf(g);
      const facts: Statement[] = [
        { text: `To the left of ${the(g)}`, truth: cols.every((c) => c > at), landmarks: [g] },
        { text: `To the right of ${the(g)}`, truth: cols.every((c) => c < at), landmarks: [g] },
      ];
      // Only for a pair that stands apart (table lamps); toy cars side by side have nothing between them.
      if (itemOf(g.kind).spread && g.count > 1) facts.push({ text: `Between ${the(g)}`, truth: Math.min(...cols) < at && Math.max(...cols) > at, landmarks: [g] });
      return facts;
    });
    // Between two different things: "Between the teddy bear and the ball", the one on the left named first.
    for (const a of landmarks)
      for (const b of landmarks) {
        if (a === b || Math.max(...colsOf(a)) >= Math.min(...colsOf(b))) continue;
        statements.push({
          text: `Between ${the(a)} and ${the(b)}`,
          truth: Math.max(...colsOf(a)) < at && Math.min(...colsOf(b)) > at,
          landmarks: [a, b],
        });
      }
    const truths = statements.filter((s) => s.truth);
    if (!truths.length) return null;
    // "Between" first (what players reach for), then any.
    const between = truths.filter((s) => s.text.startsWith('Between'));
    const pick = rng.pick(between.length ? between : truths);
    const falses = statements.filter((s) => !s.truth);
    const same = falses.filter((s) => s.landmarks.some((l) => pick.landmarks.includes(l))).map((s) => s.text);
    const others = falses.filter((s) => !s.landmarks.some((l) => pick.landmarks.includes(l))).map((s) => s.text);
    if (same.length + others.length < 2) return null;
    return { answer: pick.text, wrong: same, fallback: others };
  };
  // The rug, when the recipe has one: things on it are "On the carpet", never "On the floor".
  const rug = recipe.rug;
  const rugZone = rug ? recipe.zones.find((z) => z.surface === 'ground')?.id : undefined;

  const FAMILY: Record<string, QuestionFamily> = { colours: 'colour', missing: 'seen', beside: 'where' };
  const add = (template: string, group: PlacedGroup | null, q: Omit<Question, 'id' | 'sceneId' | 'answerIndex'>, answerIndex = 0) =>
    questions.push({
      family: FAMILY[template] ?? (template as QuestionFamily),
      ...q,
      id: `${spec.id}-${template}-${group?.kind ?? q.subject}`,
      sceneId: spec.id,
      answerIndex,
    });

  for (const group of spec.groups) {
    const item = itemOf(group.kind);
    const zone = zoneOf(group.zoneId);
    const plural = group.count > 1;

    // Only things that can appear more than once: "How many mirrors?" would always be 1, a giveaway.
    if (canBeSeveral(item)) {
      add('count', group, {
        type: 'count',
        subject: item.kind,
        prompt: `How many ${item.plural} were there?`,
        options: countOptions(group.count, knobs.closeCounts, rng),
      });
    }

    if (group.colour && item.colours) {
      add('colour', group, {
        type: 'colour',
        subject: item.kind,
        prompt: item.colourPrompt?.(plural) ?? (plural ? `What colour were the ${item.plural}?` : `What colour was the ${item.singular}?`),
        options: withColourDistractors(
          group.colour.name,
          item.colours.map((c) => c.name),
          ALL_COLOURS.map((c) => c.name),
          rng,
        ),
      });
    }

    // Things spread across the picture (street lamps along the pavement) have no single side to ask about.
    const spread = item.spread === true && group.count > 1;

    // Copies in different colours (fire hydrants on Hard): which colours were they?
    if (group.colours && item.colours) {
      const answer = colourList(group.colours.map((c) => c.name));
      const names = item.colours.map((c) => c.name);
      const n = new Set(group.colours.map((c) => c.name)).size;
      const sameSize = combinations(names, n).map(colourList);
      const allOne = names.map((c) => `All ${c.toLowerCase()}`);
      add('colours', group, {
        type: 'colour',
        subject: item.kind,
        prompt: `What colours were the ${item.plural}?`,
        options: withColourDistractors(answer, sameSize, [...allOne, ...combinations(names, Math.min(names.length, n + 1)).map(colourList)], rng),
      });
    }

    const sameZoneCells = zones
      .filter((z) => item.zones.includes(z.id))
      .flatMap((z) => (['left', 'centre', 'right'] as Region[]).map((r) => cellLabel(z, r)));
    // On the rug, the answer is "On the carpet"; off it, "On the floor, on the left" with "On the carpet" as a wrong
    // answer for things that can go on it. Some copies on it and some off: not asked.
    const onRugBand = rug && group.zoneId === rugZone;
    const rugAnswer = onRugBand && group.onRug === 'all';
    const rugOption = onRugBand && !item.avoidRug ? [rug.label] : [];
    // Next to a landmark at its own depth, when there is one: "Between the teddy bear and the ball" is easier to judge
    // on a small screen than "on the left".
    const nextTo = besideLandmark(group);
    const prompt = plural ? `Where were the ${item.plural}?` : `Where was the ${item.singular}?`;
    // Loose things in a place that names its places: places, not sides ("On the carpet" or "On the floor", "On the
    // path" or "On the grass", against "On the sofa", "On the bench"). Players didn't like left / middle / right.
    // Only when the thing could really be in more than one of them: "On the pond" for a swan would be a giveaway.
    // The other bands it could be in. (Bands it can't be in would be free eliminations: "Where was the slide? On the
    // pond".)
    const otherBands = zones.filter((z) => z.id !== group.zoneId && item.zones.includes(z.id)).map((z) => z.label);
    const onGround = zone.surface === 'ground' && isFlat(zone);
    const placesHere = !!recipe.places?.length && onGround && !standsBack(group) && ((onRugBand && !item.avoidRug) || otherBands.length > 0);
    // On a wall, with what stood below it: "On the wall on the right, above the table lamp".
    const onWall = spread ? null : wallWhere(group);
    if (onWall) {
      add('where', group, { type: 'position', subject: item.kind, prompt, options: withDistractors(onWall.answer, onWall.wrong, [], rng) });
    } else if (!spread && !(onRugBand && group.onRug === 'some')) {
      if (placesHere) {
        const answer = rugAnswer ? rug.label : zone.label;
        // The other of carpet and floor, and the other bands it could be in, always; then the place's other places.
        const opposite = [...(rugAnswer ? [zone.label] : rugOption), ...otherBands];
        add('where', group, { type: 'position', subject: item.kind, prompt, options: withDistractors(answer, opposite, recipe.places!, rng) });
        // The landmark version too (the round still asks at most one "where").
        if (nextTo) add('beside', group, { type: 'position', subject: item.kind, prompt, options: withDistractors(nextTo.answer, nextTo.wrong, nextTo.fallback, rng) });
      } else if (nextTo || !recipe.places) {
        // A room that names its places never falls back to left / middle / right: with no landmark, no "where".
        add('where', group, {
          type: 'position',
          subject: item.kind,
          prompt,
          // Only places this thing could really be ("In the sky" is never offered for a dog).
          options: nextTo
            ? withDistractors(nextTo.answer, nextTo.wrong, nextTo.fallback, rng)
            : withDistractors(rugAnswer ? rug.label : cellLabel(zone, group.region), [...sameZoneCells, ...rugOption], [], rng),
        });
      }
    }

    // Only ask "what was on the left…" when exactly one kind of thing is there (and it isn't on the rug: that's
    // "on the carpet", not "on the floor").
    const sharesSpot = spec.groups.some((g) => g !== group && g.zoneId === group.zoneId && sidesOf(g).has(group.region)) || (onRugBand && group.onRug !== 'none');
    // On a wall, the thing below as a landmark: "What was on the wall on the right, above the armchair?"
    const landmark = landmarkBelow(group);
    const cell = lower(cellLabel(zone, group.region));
    // For a plural answer ("Hot-air balloons"), only things that can appear in groups make believable
    // wrong options: never "Suns" or "Buses".
    const fits = (i: ItemDef) => i.kind !== item.kind && (!plural || canBeSeveral(i));
    // Never something hiding in the picture (a crab under the beach towel): it could really be there.
    const sameZoneKinds = recipe.items.filter((i) => fits(i) && i.zones.includes(zone.id) && !spec.details?.alsoSeen?.includes(i.kind));
    // A room that names its places only asks this with a landmark ("above the armchair"): "on the wall, in the
    // middle" alone was too hard to place.
    if (!spread && !sharesSpot && (landmark || !recipe.places)) add('what-here', group, {
      type: 'object',
      subject: item.kind,
      prompt: landmark ? `What was ${cell.replace(', ', ' ')}, above ${landmark}?` : `What was ${cell}?`,
      options: withDistractors(
        nounPhrase(item, plural),
        // Only things that belong in this band: never "Zookeepers" for the sky.
        sameZoneKinds.map((i) => nounPhrase(i, plural)),
        [],
        rng,
      ),
    });
  }

  // "What was on the carpet?": when one or two kinds of thing are on it (and nothing is half on, half off). With two,
  // the answer names both ("A cat and a cushion"); wrong answers swap one of them for something else, or name just
  // one, so both have to be remembered.
  if (rug) {
    const onIt = spec.groups.filter((g) => g.zoneId === rugZone && g.onRug !== 'none');
    if (onIt.length >= 1 && onIt.length <= 2 && onIt.every((g) => g.onRug === 'all')) {
      // Each thing as it was ("A cat", "Two cushions" read as "Cushions"), in the picture's order.
      const phraseOf = (kind: string, plural: boolean) => nounPhrase(itemOf(kind), plural);
      const pair = (a: string, b: string) => `${a} and ${lower(b)}`;
      const answerParts = onIt.map((g) => phraseOf(g.kind, g.count > 1));
      const answer = answerParts.length === 2 ? pair(answerParts[0], answerParts[1]) : answerParts[0];
      // Things that could be on it: never furniture or plants (`avoidRug`), or something hiding in the picture.
      const others = recipe.items
        .filter((i) => !onIt.some((g) => g.kind === i.kind) && i.zones.includes(rugZone!) && !i.avoidRug && !spec.details?.alsoSeen?.includes(i.kind))
        .map((i) => nounPhrase(i, false));
      // A mix of one thing and two things, so the answer isn't the odd one out: two pairs and a single for a pair,
      // two singles and a pair for a single.
      const swapped = rng.shuffle(others.flatMap((o) => [pair(answerParts[0], o), pair(answerParts[1] ?? answerParts[0], o)]));
      const wrong =
        answerParts.length === 2
          ? [...swapped.slice(0, 2), rng.pick(answerParts)]
          : [...rng.shuffle(others).slice(0, 2), ...swapped.slice(0, 1)];
      add('what-here', null, {
        type: 'object',
        subject: `rug-${onIt.map((g) => g.kind).join('-')}`,
        prompt: `What was ${lower(rug.label)}?`,
        options: withDistractors(answer, wrong, [], rng),
      });
    }
  }

  // "What was on the pond?": when only one kind of thing is in a whole band, no side needed. (A rug's band has its
  // own question, "What was on the carpet?".)
  for (const z of zones) {
    if (rug && z.id === rugZone) continue;
    const here = spec.groups.filter((g) => g.zoneId === z.id);
    if (here.length !== 1) continue;
    const group = here[0];
    const item = itemOf(group.kind);
    const plural = group.count > 1;
    const could = recipe.items.filter((i) => i.kind !== item.kind && i.zones.includes(z.id) && (!plural || canBeSeveral(i)) && !spec.details?.alsoSeen?.includes(i.kind));
    add('what-here', null, {
      type: 'object',
      subject: `band-${z.id}`,
      prompt: `What was ${lower(z.label)}?`,
      options: withDistractors(nounPhrase(item, plural), could.map((i) => nounPhrase(i, plural)), [], rng),
    });
  }

  // Houses in the street: "What number was the yellow house?" and "What colour was number 1210?".
  // Both are about the same house (one subject), so a round asks at most one of them per house.
  const houses = spec.details?.houses ?? [];
  if (knobs.houseNumbers && houses.length) {
    const numbers = houses.map((h) => String(h.number));
    for (const house of houses) {
      const n = String(house.number);
      const subject = { subject: `house-${n}` };
      questions.push({
        id: `${spec.id}-house-number-${n}`,
        sceneId: spec.id,
        answerIndex: 0,
        type: 'number',
        family: 'detail',
        ...subject,
        prompt: `What number was on the ${house.colour.name.toLowerCase()} house?`,
        options: withDistractors(n, numbers, numberLookalikes(house.number), rng),
      });
      questions.push({
        id: `${spec.id}-house-colour-${n}`,
        sceneId: spec.id,
        answerIndex: 0,
        type: 'colour',
        family: 'detail',
        ...subject,
        prompt: `What colour was house number ${n}?`,
        options: withColourDistractors(
          house.colour.name,
          houses.map((h) => h.colour.name),
          ['Yellow', 'Blue', 'Green', 'Pink', 'Orange', 'Purple'],
          rng,
        ),
      });
    }
  }

  // Any recipe's backdrop facts ("What colour was the barn?"), asked on the same levels as house numbers;
  // a few (the clock) on every level, and some only when their thing is in the picture.
  for (const fact of spec.details?.facts ?? []) {
    if (!(knobs.houseNumbers || fact.everyLevel)) continue;
    if (fact.needs && !spec.groups.some((g) => g.kind === fact.needs)) continue;
    {
      questions.push({
        id: `${spec.id}-fact-${fact.id}`,
        sceneId: spec.id,
        answerIndex: 0,
        type: fact.type,
        family: 'detail',
        spotlight: fact.spotlight,
        subject: fact.id,
        prompt: fact.prompt,
        options: (fact.type === 'colour' ? withColourDistractors : withDistractors)(fact.answer, fact.wrong, fact.fallback ?? [], rng),
      });
    }
  }

  if (absent.length >= 3 && present.length >= 3) {
    const seen = rng.pick(present);
    add('seen', null, {
      type: 'object',
      subject: seen.kind,
      prompt: 'Which of these was in the picture?',
      options: withDistractors(cap(seen.singular), absent.map((i) => cap(i.singular)), [], rng),
    });
    const missing = rng.pick(absent);
    add('missing', null, {
      type: 'object',
      subject: missing.kind,
      prompt: 'Which of these was NOT in the picture?',
      options: withDistractors(cap(missing.singular), present.map((i) => cap(i.singular)), [], rng),
    });
  }

  // ---- Questions that link two things, or the whole picture ----------------------------------------

  /** Groups that can be counted (never the sun or the sofa). */
  const countable = spec.groups.filter((g) => canBeSeveral(itemOf(g.kind)));

  // "Were there more kites or birds?": two things to remember and weigh up. Sometimes it's a tie.
  const pairs = rng.shuffle(combinations(countable, 2)).slice(0, 2);
  for (const [a, b] of pairs) {
    const [ia, ib] = [itemOf(a.kind), itemOf(b.kind)];
    const options = [cap(ia.plural), cap(ib.plural), 'The same number'];
    add(
      'compare',
      null,
      {
        type: 'count',
        subject: `compare-${a.kind}-${b.kind}`,
        prompt: `Were there more ${ia.plural} or more ${ib.plural}?`,
        options,
        fixedOrder: true,
      },
      a.count > b.count ? 0 : b.count > a.count ? 1 : 2,
    );
  }

  // "Which was there the most of?": a clear winner, at least two ahead of nothing.
  const byCount = [...countable].sort((a, b) => b.count - a.count);
  if (byCount.length >= 4 && byCount[0].count > byCount[1].count) {
    const top = itemOf(byCount[0].kind);
    add('most', null, {
      type: 'count',
      subject: `most-${top.kind}`,
      prompt: 'Which was there the most of?',
      options: withDistractors(cap(top.plural), byCount.slice(1).map((g) => cap(itemOf(g.kind).plural)), [], rng),
    });
  }

  // "Which was there just one of?": only one countable thing was on its own. Anything else that was
  // single (the sun, the sofa) is never a wrong option, since it was "just one" too.
  const singles = countable.filter((g) => g.count === 1);
  const several = countable.filter((g) => g.count > 1);
  if (singles.length === 1 && several.length >= 2) {
    const only = itemOf(singles[0].kind);
    add('most', null, {
      type: 'count',
      subject: `only-${only.kind}`,
      prompt: 'Which was there just one of?',
      options: withDistractors(
        nounPhrase(only, false),
        several.map((g) => nounPhrase(itemOf(g.kind), false)),
        absent.filter(canBeSeveral).map((i) => nounPhrase(i, false)),
        rng,
      ),
    });
  }

  // "What was in the sky, above the pumpkins?": the only thing above (or below) it, in the same third and another band.
  const single = spec.groups.filter((g) => !(itemOf(g.kind).spread && g.count > 1) && !isWide(g) && !faraway(g));
  // The question names where the answer was ("in the sky", "on the wall"): "above the pumpkins" alone made players
  // think of the barn on the hill. A few band names read oddly there ("What was close by, above the bench?"), so
  // those questions stay plain.
  const PLAIN_BANDS = new Set(['Close by', 'At the front', 'Near the hills']);
  const where = (zoneId: string) => {
    const label = zoneOf(zoneId).label;
    return PLAIN_BANDS.has(label) ? '' : `${label[0].toLowerCase()}${label.slice(1)}, `;
  };
  // The thing asked about and the answer must both be alone in their third of their band (`alone`).
  for (const group of single) {
    const item = itemOf(group.kind);
    if (!alone(group)) continue;
    for (const dir of ['above', 'below'] as const) {
      const isDir = (g: PlacedGroup) => (dir === 'above' ? zoneIndex(g) < zoneIndex(group) : zoneIndex(g) > zoneIndex(group));
      const near = spec.groups.filter((g) => g !== group && isDir(g) && reaches(g, group.region) && !faraway(g));
      if (near.length !== 1 || !single.includes(near[0]) || !alone(near[0])) continue;
      // Two flat bands (the path and the grass): the one lower down is nearer, not "below". "What was on the grass,
      // below the dog?" made no sense.
      if (isFlat(zoneOf(group.zoneId)) && isFlat(zoneOf(near[0].zoneId))) continue;
      const target = near[0];
      const answerItem = itemOf(target.kind);
      const plural = target.count > 1;
      const fits = (i: ItemDef) => i.kind !== answerItem.kind && i.kind !== item.kind && (!plural || canBeSeveral(i));
      const elsewhere = spec.groups.filter((g) => g !== group && g !== target).map((g) => itemOf(g.kind));
      // Once the question says where, wrong answers that can't be there are easy to rule out: so first come
      // things that could be in the answer's band, from the picture and then not in it.
      const inBand = (i: ItemDef) => i.zones.includes(target.zoneId);
      const inBandWrong = [...elsewhere, ...absent].filter((i) => fits(i) && inBand(i)).map((i) => nounPhrase(i, plural));
      add(dir, group, {
        type: 'position',
        family: 'relation',
        subject: item.kind,
        prompt: `What was ${where(target.zoneId)}${dir} ${group.count > 1 ? `the ${item.plural}` : `the ${item.singular}`}?`,
        options: withDistractors(
          nounPhrase(answerItem, plural),
          inBandWrong,
          // Something that can't be there is a giveaway: only to make up three choices, never a fourth.
          where(target.zoneId) && new Set(inBandWrong).size >= 2 ? [] : elsewhere.filter((i) => fits(i) && !inBand(i)).map((i) => nounPhrase(i, plural)),
          rng,
        ),
      });
    }
  }

  // "What else was the same colour as the kites?": only when exactly one other thing shares the colour,
  // and nothing with a fixed colour (a red crab), a house or the barn could be argued as an answer too.
  const backdropColours = new Set([
    ...(spec.details?.houses ?? []).map((h) => h.colour.name),
    ...(spec.details?.facts ?? []).filter((f) => f.type === 'colour').map((f) => f.answer),
  ]);
  const fixedColours = new Set(spec.groups.map((g) => itemOf(g.kind)).filter((i) => !i.colours && i.tone).map((i) => nearestColour(i.tone!)));
  const mixedColours = new Set(spec.groups.flatMap((g) => (g.colours ?? []).map((c) => c.name)));
  const coloured = spec.groups.filter((g) => g.colour && itemOf(g.kind).colours);
  for (const group of coloured) {
    const name = group.colour!.name;
    if (backdropColours.has(name) || fixedColours.has(name) || mixedColours.has(name)) continue;
    const twins = coloured.filter((g) => g !== group && g.colour!.name === name);
    if (twins.length !== 1) continue;
    const twin = twins[0];
    const item = itemOf(group.kind);
    const label = (g: PlacedGroup) => cap(colourNoun(itemOf(g.kind), g.count > 1));
    add('twins', group, {
      type: 'colour',
      subject: item.kind,
      prompt: `What else was the same colour as ${colourNoun(item, group.count > 1)}?`,
      options: withDistractors(
        label(twin),
        // Never a thing in a colour that clashes with it ("the orange balloon" for red kites).
        coloured.filter((g) => g.colour!.name !== name && !clashes(g.colour!.name, name)).map(label),
        absent.filter((i) => i.colours).map((i) => cap(colourNoun(i, false))),
        rng,
      ),
    });
  }

  // True or false: a quick change of pace. Half are true, half false.
  const statements: { subject: string; type: Question['type']; text: string; truth: boolean }[] = [];
  for (const group of countable) {
    const item = itemOf(group.kind);
    const truth = rng.next() < 0.5;
    const n = truth ? group.count : group.count === 1 ? 2 : group.count + (rng.next() < 0.5 ? -1 : 1);
    if (n < 1 || n >= NUMBER_WORDS.length) continue;
    const text = n === 1 ? `There was one ${item.singular}.` : `There were ${NUMBER_WORDS[n]} ${item.plural}.`;
    statements.push({ subject: item.kind, type: 'count', text, truth });
  }
  for (const group of coloured) {
    const item = itemOf(group.kind);
    // A false colour is never one that clashes with the real one: "The kites were orange" when they were red is unfair.
    const others = item.colours!.filter((c) => c.name !== group.colour!.name && !clashes(c.name, group.colour!.name));
    const truth = rng.next() < 0.5 || !others.length;
    const colour = truth ? group.colour!.name : rng.pick(others).name;
    const plural = group.count > 1;
    statements.push({ subject: item.kind, type: 'colour', text: `${cap(colourNoun(item, plural))} ${colourVerb(item, plural)} ${colour.toLowerCase()}.`, truth });
  }
  if (absent.length) {
    const item = rng.pick(absent);
    const text = item.article === 'the' ? `The ${item.singular} was in the picture.` : `There was ${item.article} ${item.singular} in the picture.`;
    statements.push({ subject: item.kind, type: 'object', text, truth: false });
  }
  for (const s of rng.shuffle(statements).slice(0, 3)) {
    questions.push({
      id: `${spec.id}-true-false-${s.subject}`,
      sceneId: spec.id,
      type: s.type,
      family: 'true-false',
      subject: s.subject,
      prompt: `True or false?\n${s.text}`,
      options: ['True', 'False'],
      answerIndex: s.truth ? 0 : 1,
      fixedOrder: true,
    });
  }

  // A question needs at least three options to be a fair choice (true or false has its own two).
  return questions.filter((q) => q.family === 'true-false' || q.options.length >= 3);
}
