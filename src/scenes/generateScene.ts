import { createRng, type Rng } from './random';
import type { Box, ItemDef, PlacedDecor, PlacedGroup, Recipe, Region, SceneSpec, ZoneDef } from './types';

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

/** Breathing room between things side by side. */
const SPACING = 1.15;
/** Everything is drawn this much bigger than its real-world size so small things are easy to spot on a phone. */
const SIZE_BOOST = 1.35;
/** Big things may shrink to this fraction of their size to fit a cell, so they still look bigger than small things. */
const MIN_FIT = 0.7;
/** How much of a back-row thing's base may tuck behind the row in front. Small, so everything stays countable. */
const ROW_TUCK = 0.1;

type Cell = (typeof REGIONS)[number];

/** Air and wall bands: things keep their size and are spread over the cell. */
function layoutFloating(item: ItemDef, count: number, zone: ZoneDef, cell: Cell, height: number, rng: Rng): Box[] | null {
  const full = (item.size * SIZE_BOOST) / item.h;
  const top = zone.top * height;
  const cellW = cell.x1 - cell.x0;
  const cellH = (zone.bottom - zone.top) * height;

  for (let rows = 1; rows <= count; rows++) {
    const cols = Math.ceil(count / rows);
    const fit = Math.min(1, cellW / (cols * item.w * full * SPACING), cellH / (rows * item.h * full * SPACING));
    if (fit < MIN_FIT) continue;
    const scale = full * fit;
    const w = item.w * scale;
    const h = item.h * scale;
    const slotW = cellW / cols;
    const slotH = cellH / rows;
    return Array.from({ length: count }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const inRow = row === rows - 1 ? count - cols * (rows - 1) : cols;
      const rowOffset = ((cols - inRow) * slotW) / 2;
      return {
        x: cell.x0 + rowOffset + col * slotW + (slotW - w) * (0.25 + 0.5 * rng.next()),
        y: top + row * slotH + (slotH - h) * rng.next(),
        scale,
      };
    });
  }
  return null;
}

/**
 * Ground bands: things stand on the floor in rows, front row lowest and biggest,
 * each row further back a little higher and smaller (perspective).
 */
function layoutGround(item: ItemDef, count: number, zone: ZoneDef, cell: Cell, height: number, rng: Rng): Box[] | null {
  const top = zone.top * height;
  const bottom = zone.bottom * height;
  const floorTop = (zone.floor ?? zone.top) * height;
  const far = zone.farScale ?? 1;
  const near = zone.nearScale ?? 1;
  const cellW = cell.x1 - cell.x0;
  const base = (item.size * SIZE_BOOST) / item.h;
  const perspective = (y: number) => far + (near - far) * Math.min(1, Math.max(0, (y - floorTop) / (bottom - floorTop || 1)));

  /** Rows from the front, starting with the front row standing at `front`. Null if they don't fit. */
  const stack = (rows: number, cols: number, front: number) => {
    // The front row is the widest and tallest; if it needs to shrink to fit, every row shrinks by the same amount.
    const frontScale = base * perspective(front);
    const fit = Math.min(1, cellW / (cols * item.w * frontScale * SPACING), (front - top) / (item.h * frontScale));
    if (fit < MIN_FIT) return null;
    const result: { baseline: number; scale: number }[] = [];
    let baseline = front;
    for (let r = 0; r < rows; r++) {
      const scale = base * perspective(baseline) * fit;
      const h = item.h * scale;
      if (baseline < floorTop || baseline - h < top) return null;
      result.push({ baseline, scale });
      baseline -= h * (1 - ROW_TUCK);
    }
    return result;
  };

  for (let rows = 1; rows <= (zone.singleRow ? 1 : count); rows++) {
    const cols = Math.ceil(count / rows);
    const tight = stack(rows, cols, bottom);
    if (!tight) continue;

    // Push the group a random way back into the band so groups sit at different depths.
    const room = tight[tight.length - 1].baseline - floorTop;
    const rowsInfo = stack(rows, cols, bottom - room * rng.next() * 0.8) ?? tight;

    const boxes: Box[] = [];
    rowsInfo.forEach(({ baseline, scale }, r) => {
      // Back rows are full; any remainder goes in the front row.
      const inRow = r === 0 ? count - cols * (rows - 1) : cols;
      const slotW = cellW / cols;
      const w = item.w * scale;
      const h = item.h * scale;
      const rowOffset = ((cols - inRow) * slotW) / 2 + (r % 2 ? slotW * 0.2 : 0);
      for (let c = 0; c < inRow; c++) {
        const x = cell.x0 + rowOffset + c * slotW + (slotW - w) * (0.3 + 0.4 * rng.next());
        boxes.push({ x: Math.min(x, cell.x1 - w), y: baseline - h, scale });
      }
    });
    return boxes;
  }
  return null;
}

function spreadDecor(recipe: Recipe, height: number, rng: Rng): PlacedDecor[] {
  return (recipe.decor ?? []).flatMap((decor) => {
    const count = rng.int(decor.min, decor.max);
    const slotW = 900 / count;
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

/** Fills a recipe with random contents for a picture `height` tall. Same inputs, same scene. */
export function generateScene(recipe: Recipe, knobs: SceneKnobs, seed: number, height: number): SceneSpec {
  const rng = createRng(seed);
  const variant = rng.pick(recipe.variants);
  const cells = rng.shuffle(recipe.zones.flatMap((zone) => REGIONS.map((cell) => ({ zone, cell }))));
  const used = new Set<string>();
  const groups: PlacedGroup[] = [];

  for (const item of rng.shuffle(recipe.items)) {
    if (groups.length >= knobs.groups) break;
    const most = item.countable === false ? 1 : Math.min(item.maxCount, knobs.maxCount);
    const wanted = rng.int(1, most);

    // Try each free cell this item belongs in; take the first where at least one fits.
    for (const { zone, cell } of cells) {
      if (!item.zones.includes(zone.id) || used.has(`${zone.id}:${cell.id}`)) continue;
      const layout = zone.surface === 'ground' ? layoutGround : layoutFloating;
      let placed: { count: number; boxes: Box[] } | null = null;
      for (let count = wanted; count >= 1 && !placed; count--) {
        const boxes = layout(item, count, zone, cell, height, rng);
        if (boxes) placed = { count, boxes };
      }
      if (!placed) continue;
      used.add(`${zone.id}:${cell.id}`);
      groups.push({
        kind: item.kind,
        count: placed.count,
        colour: item.colours ? rng.pick(item.colours) : undefined,
        zoneId: zone.id,
        region: cell.id,
        boxes: placed.boxes,
      });
      break;
    }
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
