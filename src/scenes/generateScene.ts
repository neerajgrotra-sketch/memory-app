import { createRng, type Rng } from './random';
import type { Box, ItemDef, PlacedGroup, Recipe, Region, SceneSpec, ZoneDef } from './types';

export interface SceneKnobs {
  /** How many different kinds of thing appear. */
  groups: number;
  /** Most of any one kind. */
  maxCount: number;
}

/** Columns with clear gaps between them, so nothing sits on the line between "left" and "middle". */
export const REGIONS: { id: Region; x0: number; x1: number }[] = [
  { id: 'left', x0: 40, x1: 280 },
  { id: 'centre', x0: 330, x1: 570 },
  { id: 'right', x0: 620, x1: 860 },
];

/** Items are drawn larger than their design size so they read well on a phone. */
const ITEM_SCALE = 1.5;
/** Smaller than this and things get hard to see in a few seconds. */
const MIN_SCALE = 0.75;
/** Breathing room around each thing so nothing overlaps. */
const SPACING = 1.2;

/** Lays out `count` copies of an item in one cell, or returns null if they would be too small. */
function layoutGroup(item: ItemDef, count: number, zone: ZoneDef, region: (typeof REGIONS)[number], rng: Rng): Box[] | null {
  const cellW = region.x1 - region.x0;
  const cellH = zone.bottom - zone.top;

  let best = { scale: 0, rows: 1, cols: count };
  for (let rows = 1; rows <= (zone.singleRow ? 1 : count); rows++) {
    const cols = Math.ceil(count / rows);
    const scale = Math.min(ITEM_SCALE, cellW / (cols * item.w * SPACING), cellH / (rows * item.h * SPACING));
    if (scale > best.scale) best = { scale, rows, cols };
  }
  if (best.scale < MIN_SCALE) return null;

  const { scale, rows, cols } = best;
  const slotW = cellW / cols;
  const slotH = cellH / rows;
  const w = item.w * scale;
  const h = item.h * scale;

  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inRow = row === rows - 1 ? count - cols * (rows - 1) : cols;
    const rowOffset = ((cols - inRow) * slotW) / 2;
    const x = region.x0 + rowOffset + col * slotW + (slotW - w) * (0.3 + 0.4 * rng.next());
    const y = zone.ground
      ? zone.top + row * slotH + (slotH - h) * (0.85 + 0.15 * rng.next())
      : zone.top + row * slotH + (slotH - h) * rng.next();
    return { x, y, scale };
  });
}

/** Fills a recipe with random contents. The same recipe, knobs and seed always give the same scene. */
export function generateScene(recipe: Recipe, knobs: SceneKnobs, seed: number): SceneSpec {
  const rng = createRng(seed);
  const variant = rng.pick(recipe.variants);
  const cells = rng.shuffle(recipe.zones.flatMap((zone) => REGIONS.map((region) => ({ zone, region }))));
  const used = new Set<string>();
  const groups: PlacedGroup[] = [];

  for (const item of rng.shuffle(recipe.items)) {
    if (groups.length >= knobs.groups) break;
    const cell = cells.find((c) => item.zones.includes(c.zone.id) && !used.has(`${c.zone.id}:${c.region.id}`));
    if (!cell) continue;

    const most = item.countable === false ? 1 : Math.min(item.maxCount, knobs.maxCount);
    for (let count = rng.int(1, most); count >= 1; count--) {
      const boxes = layoutGroup(item, count, cell.zone, cell.region, rng);
      if (!boxes) continue;
      used.add(`${cell.zone.id}:${cell.region.id}`);
      groups.push({
        kind: item.kind,
        count,
        colour: item.colours ? rng.pick(item.colours) : undefined,
        zoneId: cell.zone.id,
        region: cell.region.id,
        boxes,
      });
      break;
    }
  }

  return { id: `${recipe.id}-${seed.toString(36)}`, seed, recipeId: recipe.id, variantId: variant.id, groups };
}
