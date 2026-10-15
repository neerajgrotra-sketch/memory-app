import type { Question } from '@/types/game';

import { ALL_COLOURS } from './colours';
import { createRng, type Rng } from './random';
import { regionOf } from './layout';
import type { ItemDef, PlacedGroup, Recipe, Region, SceneSpec, ZoneDef } from './types';

export interface QuestionKnobs {
  /** Wrong counts right next to the answer (4 vs 5) instead of further away. */
  closeCounts: boolean;
  /** Ask about house numbers and house colours (Medium and Hard). */
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

/** The answer plus three different wrong options, preferring the given candidates first. */
function withDistractors(answer: string, preferred: string[], fallback: string[], rng: Rng): [string, string, string, string] {
  const pool = [...rng.shuffle(preferred), ...rng.shuffle(fallback)].filter((o) => o !== answer);
  const unique = [...new Set(pool)].slice(0, 3);
  return [answer, unique[0], unique[1], unique[2]];
}

function countOptions(n: number, close: boolean, rng: Rng): string[] {
  const candidates = Array.from({ length: Math.max(6, n + 3) }, (_, i) => i + 1).filter((c) => c !== n);
  const picked = close
    ? rng.shuffle(candidates).sort((a, b) => Math.abs(a - n) - Math.abs(b - n)).slice(0, 3)
    : rng.shuffle(candidates.filter((c) => Math.abs(c - n) <= 3)).slice(0, 3);
  return [n, ...picked].map(String);
}

/** Writes every question the scene can answer. Answers come straight from the scene, so they are always right. */
export function generateQuestions(spec: SceneSpec, recipe: Recipe, knobs: QuestionKnobs): Question[] {
  const rng = createRng(spec.seed ^ 0x9e3779b9);
  const itemOf = (kind: string) => recipe.items.find((i) => i.kind === kind)!;
  const zoneOf = (id: string) => recipe.zones.find((z) => z.id === id)!;
  const present = spec.groups.map((g) => itemOf(g.kind));
  const absent = recipe.items.filter((i) => !spec.groups.some((g) => g.kind === i.kind));
  const questions: Question[] = [];
  /** Every side a group is on: one, or each side a spread group has a copy on. */
  const sidesOf = (g: PlacedGroup): Set<Region> => {
    const it = itemOf(g.kind);
    if (!(it.spread && g.count > 1)) return new Set([g.region]);
    return new Set(g.boxes.map((b) => regionOf(b.x + b.w / 2)));
  };
  // Only bands things can go in make believable wrong answers (not the room's bare ceiling).
  const zones = recipe.zones.filter((z) => z.rows > 0);

  const add = (template: string, group: PlacedGroup | null, q: Omit<Question, 'id' | 'sceneId' | 'answerIndex'>) =>
    questions.push({ ...q, id: `${spec.id}-${template}-${group?.kind ?? q.subject}`, sceneId: spec.id, answerIndex: 0 });

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
        options: withDistractors(
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
        options: withDistractors(answer, sameSize, [...allOne, ...combinations(names, Math.min(names.length, n + 1)).map(colourList)], rng),
      });
    }

    const sameZoneCells = zones
      .filter((z) => item.zones.includes(z.id))
      .flatMap((z) => (['left', 'centre', 'right'] as Region[]).map((r) => cellLabel(z, r)));
    const otherCells = zones.flatMap((z) => (['left', 'centre', 'right'] as Region[]).map((r) => cellLabel(z, r)));
    if (!spread) add('where', group, {
      type: 'position',
      subject: item.kind,
      prompt: plural ? `Where were the ${item.plural}?` : `Where was the ${item.singular}?`,
      options: withDistractors(cellLabel(zone, group.region), sameZoneCells, otherCells, rng),
    });

    // Only ask "what was on the left…" when exactly one kind of thing is there.
    const sharesSpot = spec.groups.some((g) => g !== group && g.zoneId === group.zoneId && sidesOf(g).has(group.region));
    // For a plural answer ("Hot-air balloons"), only things that can appear in groups make believable
    // wrong options: never "Suns" or "Buses".
    const fits = (i: ItemDef) => i.kind !== item.kind && (!plural || canBeSeveral(i));
    const sameZoneKinds = recipe.items.filter((i) => fits(i) && i.zones.includes(zone.id));
    const otherKinds = recipe.items.filter(fits);
    if (!spread && !sharesSpot) add('what-here', group, {
      type: 'object',
      subject: item.kind,
      prompt: `What was ${lower(cellLabel(zone, group.region))}?`,
      options: withDistractors(
        nounPhrase(item, plural),
        sameZoneKinds.map((i) => nounPhrase(i, plural)),
        otherKinds.map((i) => nounPhrase(i, plural)),
        rng,
      ),
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
        ...subject,
        prompt: `What number was on the ${house.colour.name.toLowerCase()} house?`,
        options: withDistractors(n, numbers, numberLookalikes(house.number), rng),
      });
      questions.push({
        id: `${spec.id}-house-colour-${n}`,
        sceneId: spec.id,
        answerIndex: 0,
        type: 'colour',
        ...subject,
        prompt: `What colour was house number ${n}?`,
        options: withDistractors(
          house.colour.name,
          houses.map((h) => h.colour.name),
          ['Yellow', 'Blue', 'Green', 'Pink', 'Orange', 'Purple'],
          rng,
        ),
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

  return questions;
}
