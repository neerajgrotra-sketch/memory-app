import { createRng, type Rng } from './random';
import {
  SCENE_WIDTH,
  heightFactor,
  type Box,
  type ItemDef,
  type PlacedDecor,
  type PlacedGroup,
  type Recipe,
  type Region,
  type SceneSpec,
  type ZoneDef,
} from './types';

export interface SceneKnobs {
  /** How many different kinds of thing appear. */
  groups: number;
  /** Most of any one kind. */
  maxCount: number;
}

/** Keep things this far from the left and right edges. */
const EDGE = 20;
/** Breathing room between things side by side. */
const SPACING = 1.12;
/** Gap between a row and the row behind it (fraction of the front row's height). */
const ROW_GAP = 0.08;
/** Clear space kept around every thing so nothing touches or overlaps. */
const PAD = 10;
/** Anything drawn smaller than this (picture units) is too small to spot in a few seconds. */
export const MIN_VISIBLE = 42;
/** A group's centre stays this far from the lines between left / middle / right, so its side is never in doubt. */
export const THIRD_MARGIN = 45;
/** Keep a little sky or wall above the top-most things. */
export const TOP_MARGIN = 0.03;
/** Random spots tried per group before giving up on that zone. */
const ATTEMPTS = 60;

export const THIRDS: [number, number] = [SCENE_WIDTH / 3, (SCENE_WIDTH * 2) / 3];

export function regionOf(centreX: number): Region {
  return centreX < THIRDS[0] ? 'left' : centreX < THIRDS[1] ? 'centre' : 'right';
}

/** Picture units per centimetre at height `y` (picture units), from the recipe's camera. */
export function scaleAt(recipe: Recipe, y: number, height: number): number {
  const { horizon, ref, pxPerCm } = recipe.camera;
  return pxPerCm * heightFactor(height) * ((y / height - horizon) / (ref - horizon));
}

/** Scale for anything hung on a wall or floating in a band (ground things use `scaleAt` at their feet). */
export function zoneScale(recipe: Recipe, zone: ZoneDef, height: number): number {
  return zone.surface === 'air'
    ? (zone.pxPerCm ?? 1) * heightFactor(height)
    : scaleAt(recipe, (zone.plane ?? zone.bottom) * height, height);
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Width of `n` things side by side with breathing room between them (none outside the ends). */
const rowWidth = (n: number, w: number) => n * w + (n - 1) * w * (SPACING - 1);

const hits = (a: Rect, b: Rect) => a.x0 < b.x1 + PAD && b.x0 < a.x1 + PAD && a.y0 < b.y1 + PAD && b.y0 < a.y1 + PAD;

interface Row {
  /** Ground: where feet stand. Air/wall: top of the row. */
  y: number;
  scale: number;
  count: number;
}

/** Works out the rows for a group at a random spot in the zone, or null if it can't go there. */
function planRows(item: ItemDef, count: number, zone: ZoneDef, recipe: Recipe, height: number, rng: Rng): Row[] | null {
  const usable = SCENE_WIDTH - 2 * EDGE;
  const top = zone.top * height;
  const bottom = zone.bottom * height;

  if (zone.surface === 'ground') {
    const feet = top + (bottom - top) * rng.next();
    const scale = (scaleAt(recipe, feet, height) * item.height) / item.h;
    if (item.h * scale < MIN_VISIBLE) return null;
    const twoRows = !zone.singleRow && count > 1 && rowWidth(count, item.w * scale) > usable;
    const cols = twoRows ? Math.ceil(count / 2) : count;
    if (rowWidth(cols, item.w * scale) > usable) return null;
    if (!twoRows) return [{ y: feet, scale, count }];
    const backFeet = feet - item.h * scale * (1 + ROW_GAP);
    if (backFeet < top) return null;
    const backScale = (scaleAt(recipe, backFeet, height) * item.height) / item.h;
    if (item.h * backScale < MIN_VISIBLE) return null;
    return [
      { y: feet, scale, count: count - cols },
      { y: backFeet, scale: backScale, count: cols },
    ];
  }

  const scale = (zoneScale(recipe, zone, height) * item.height) / item.h;
  if (item.h * scale < MIN_VISIBLE) return null;
  const perRow = Math.max(1, Math.floor((usable + item.w * scale * (SPACING - 1)) / (item.w * scale * SPACING)));
  const rows = Math.ceil(count / perRow);
  const rowH = item.h * scale * SPACING;
  if (rows * rowH > bottom - top) return null;
  const y0 = top + (bottom - top - rows * rowH) * rng.next();
  return Array.from({ length: rows }, (_, r) => ({
    y: y0 + r * rowH,
    scale,
    count: r === rows - 1 ? count - perRow * (rows - 1) : perRow,
  }));
}

/** Tries random spots for a group until one fits without touching anything already placed. */
function placeGroup(item: ItemDef, count: number, zone: ZoneDef, recipe: Recipe, height: number, rng: Rng, taken: Rect[]) {
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const rows = planRows(item, count, zone, recipe, height, rng);
    if (!rows) continue;

    const cols = Math.max(...rows.map((r) => r.count));
    const widest = Math.max(...rows.map((r) => item.w * r.scale));
    const groupW = rowWidth(cols, widest);

    let xMin = EDGE;
    let xMax = SCENE_WIDTH - EDGE;
    if (zone.panels) {
      const fits = zone.panels.filter(([p0, p1]) => p1 - p0 - 28 >= groupW);
      if (!fits.length) continue;
      const [p0, p1] = rng.pick(fits);
      xMin = p0 + 14;
      xMax = p1 - 14;
    }
    if (groupW > xMax - xMin) continue;

    const x0 = xMin + (xMax - xMin - groupW) * rng.next();
    const centre = x0 + groupW / 2;
    if (Math.abs(centre - THIRDS[0]) < THIRD_MARGIN || Math.abs(centre - THIRDS[1]) < THIRD_MARGIN) continue;

    const boxes: Box[] = [];
    const rects: Rect[] = [];
    const step = widest * SPACING;
    for (const row of rows) {
      const w = item.w * row.scale;
      const h = item.h * row.scale;
      const rowStart = x0 + ((cols - row.count) * step) / 2;
      for (let c = 0; c < row.count; c++) {
        const x = rowStart + c * step + (widest - w) * (0.35 + 0.3 * rng.next());
        const y = zone.surface === 'ground' ? row.y - h : row.y + (h * SPACING - h) / 2;
        boxes.push({ x, y, scale: row.scale });
        rects.push({ x0: x, y0: y, x1: x + w, y1: y + h });
      }
    }

    if (rects.some((r) => r.y0 < TOP_MARGIN * height || r.y1 > height)) continue;
    if (rects.some((r) => taken.some((t) => hits(r, t)))) continue;
    return { boxes, rects, region: regionOf(centre) };
  }
  return null;
}

function spreadDecor(recipe: Recipe, height: number, rng: Rng): PlacedDecor[] {
  return (recipe.decor ?? []).flatMap((decor) => {
    const count = rng.int(decor.min, decor.max);
    const slotW = SCENE_WIDTH / count;
    return Array.from({ length: count }, (_, i) => {
      const scale = (decor.size / decor.h) * (0.8 + 0.35 * rng.next());
      const w = decor.w * scale;
      const h = decor.h * scale;
      const y0 = decor.top * height;
      const y1 = decor.bottom * height - h;
      return {
        kind: decor.kind,
        box: { x: i * slotW + Math.max(0, slotW - w) * rng.next() - w * 0.1, y: y0 + Math.max(0, y1 - y0) * rng.next(), scale },
      };
    });
  });
}

/** Rough real-world footprint, so big things are placed first and small things fill the gaps. */
const footprint = (item: ItemDef) => item.height * item.height * (item.w / item.h);

/** Fills a recipe with random contents for a picture `height` tall. Same inputs, same scene. */
export function generateScene(recipe: Recipe, knobs: SceneKnobs, seed: number, height: number): SceneSpec {
  const rng = createRng(seed);
  const variant = rng.pick(recipe.variants);
  const pool = rng.shuffle(recipe.items);
  const taken: Rect[] = [];
  const groups: PlacedGroup[] = [];

  /** Places one kind somewhere it belongs (optionally only in `onlyZone`). Returns false if it doesn't fit. */
  const tryItem = (item: ItemDef, onlyZone?: string) => {
    const most = item.countable === false ? 1 : Math.min(item.maxCount, knobs.maxCount);
    const wanted = rng.int(1, most);
    for (const zoneId of rng.shuffle(item.zones)) {
      if (onlyZone && zoneId !== onlyZone) continue;
      const zone = recipe.zones.find((z) => z.id === zoneId)!;
      for (let count = wanted; count >= 1; count--) {
        const placed = placeGroup(item, count, zone, recipe, height, rng, taken);
        if (!placed) continue;
        taken.push(...placed.rects);
        groups.push({
          kind: item.kind,
          count,
          colour: item.colours ? rng.pick(item.colours) : undefined,
          zoneId: zone.id,
          region: placed.region,
          boxes: placed.boxes,
        });
        return true;
      }
    }
    return false;
  };

  // First make sure zones that must not be bare (a room wall) get their things, trying each candidate in turn.
  for (const zone of recipe.zones) {
    let needed = zone.minGroups ?? 0;
    for (const item of pool.filter((i) => i.zones.includes(zone.id))) {
      if (needed <= 0 || groups.length >= knobs.groups) break;
      pool.splice(pool.indexOf(item), 1);
      if (tryItem(item, zone.id)) needed--;
    }
  }

  // Then pick the rest at random and place the biggest first, so small things fill the gaps.
  const queue = pool.splice(0, Math.max(0, knobs.groups - groups.length)).sort((a, b) => footprint(b) - footprint(a));
  while (groups.length < knobs.groups && (queue.length || pool.length)) {
    // When a kind doesn't fit anywhere, the next unused kind gets a turn.
    tryItem(queue.length ? queue.shift()! : pool.shift()!);
  }

  return {
    id: `${recipe.id}-${seed.toString(36)}`,
    seed,
    recipeId: recipe.id,
    variantId: variant.id,
    height,
    groups,
    decor: spreadDecor(recipe, height, rng),
  };
}
