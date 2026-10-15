import { standsOut } from './contrast';
import {
  GAP,
  REGIONS,
  TOP_CLEAR,
  arrangements,
  boundsOf,
  centreOf,
  columnBounds,
  gapBetween,
  heightFor,
  itemWidth,
  rectOf,
  regionOf,
  rowsOf,
  rugOk,
  samplePoints,
} from './layout';
import { createRng, type Rng } from './random';
import { getRecipe } from './recipes';
import { ratioOf, type Box, type ColourDef, type ItemDef, type PlacedGroup, type Recipe, type Rect, type SceneSize, type SceneSpec, type Slot, type VariantDef, type ZoneDef } from './types';
import { validateScene } from './validateScene';

export interface SceneKnobs {
  /** How many different kinds of thing appear. */
  groups: number;
  /** Most of any one kind. */
  maxCount: number;
}

/** Fresh placements tried before showing the best one found. */
export const LAYOUT_ATTEMPTS = 12;
/** Positions tried inside a slot before moving on to the next slot. */
const JITTERS = 4;

/** Everything placement needs to know about the scene being built. */
interface Context {
  recipe: Recipe;
  variant: VariantDef;
  ratio: number;
  size: SceneSize;
  rng: Rng;
  /** Every box placed so far. */
  taken: Rect[];
  /** Slot-grid cells already used, as `zone:col:row`. */
  cells: Set<string>;
}

const cellKey = (zone: string, col: number, row: number) => `${zone}:${col}:${row}`;

/** True if `colour` stands out from every surface each rect is drawn over. */
const colourFits = (ctx: Context, colour: string, rects: Rect[]) =>
  rects.every((r) => samplePoints(r, ctx.ratio).every(([x, y]) => standsOut(colour, ctx.variant.palette[ctx.recipe.surfaceAt(x, y)])));

interface Placement {
  boxes: Box[];
  rects: Rect[];
  slot: Slot;
}

interface Want {
  item: ItemDef;
  count: number;
  zone: ZoneDef;
  /** Only this column (when laying out again, the side is a fact that must not change). */
  col?: number;
  /** Only where the group's centre falls in this third of the height. */
  third?: number;
  /** A fixed colour (laying out again) that must still stand out where it goes. */
  colour?: string;
}

/**
 * Finds a slot for `count` copies of a thing in one band: each group gets its own cells of the
 * slot grid (one column, one or more rows), with a little jitter inside them. Null if nowhere fits.
 */
function place(ctx: Context, want: Want): Placement | null {
  const { item, count, zone } = want;
  const { rng, ratio } = ctx;
  const w = itemWidth(item, ctx.size);
  const h = heightFor(item, w);
  const rows = rowsOf(zone, ratio);
  const cols = want.col === undefined ? rng.shuffle([0, 1, 2]) : [want.col];

  // Candidate cells: one column, one or more rows (tall anchors stand in the back row). Fewest rows
  // first, then the emptiest parts of the picture, so things spread out instead of bunching up.
  const used = (zoneId: string, col: number, row: number): number => (ctx.cells.has(cellKey(zoneId, col, row)) ? 1 : 0);
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  // Cells taken in the same row of this band, the same column of this band, and (counting half) the same column anywhere.
  const crowding = (col: number, row: number) =>
    sum(rows.map((_, r) => used(zone.id, col, r))) +
    sum([0, 1, 2].map((c) => used(zone.id, c, row))) +
    sum(ctx.recipe.zones.flatMap((z) => Array.from({ length: z.rows }, (_, r) => used(z.id, col, r)))) / 2;
  const candidates: { row: number; span: number; col: number; score: number }[] = [];
  for (let span = 1; span <= (item.tall ? 1 : rows.length); span++) {
    for (let row = 0; row < rows.length; row++) {
      if (item.tall ? row !== 0 : row + span > rows.length) continue;
      for (const col of cols) candidates.push({ row, span, col, score: span * 10 + crowding(col, row) + rng.next() * 1.5 });
    }
  }
  candidates.sort((a, b) => a.score - b.score);

  for (const { row, span, col } of candidates) {
    const cells = Array.from({ length: span }, (_, i) => cellKey(zone.id, col, row + i));
    if (cells.some((c) => ctx.cells.has(c))) continue;
    const bounds = columnBounds(zone, col);
    const top = rows[row].top;
    const bottom = rows[row + span - 1].bottom;

    // Staggered arrangements (zigzags, diagonals, arcs) first; straight rows and columns only if nothing else fits.
    const all = arrangements(count, w, h);
    const ordered = [...rng.shuffle(all.filter((a) => !a.straight)), ...rng.shuffle(all.filter((a) => a.straight))];
    for (const { offsets } of ordered) {
      const bw = Math.max(...offsets.map(([x]) => x)) + w;
      const bh = Math.max(...offsets.map(([, y]) => y)) + h;
      const xMin = Math.max(bounds.x0, bounds.centreMin - bw / 2);
      const xMax = Math.min(bounds.x1 - bw, bounds.centreMax - bw / 2);
      if (xMax < xMin) continue;
      // Tall anchors stand in the back row and may rise above it; everything else fits inside its cells.
      const yMin = item.tall ? Math.max(TOP_CLEAR * ratio, top - bh + (bottom - top) * 0.5) : top;
      const yMax = bottom - bh;
      if (yMax < yMin) continue;

      for (let j = 0; j < JITTERS; j++) {
        const x0 = xMin + (xMax - xMin) * rng.next();
        // Things on the ground stand towards the bottom of their row; the rest float anywhere in it.
        const t = zone.surface === 'ground' || item.tall ? 1 - 0.35 * rng.next() : rng.next();
        const y0 = yMin + (yMax - yMin) * t;
        const boxes = offsets.map(([dx, dy]) => ({ x: x0 + dx, y: (y0 + dy) / ratio, w, flip: rng.next() < 0.5 }));
        const rects = boxes.map((b) => rectOf(item, b, ratio));
        const group = boundsOf(rects);
        if (want.third !== undefined) {
          const cy = centreOf(group).y / ratio;
          if (cy < want.third / 3 || cy >= (want.third + 1) / 3) continue;
        }
        if (regionOf(centreOf(group).x) !== REGIONS[col]) continue;
        if (rects.some((r) => ctx.taken.some((t2) => gapBetween(r, t2) < GAP))) continue;
        if (rects.some((r) => !rugOk(item, r, ctx.recipe, ratio))) continue;
        if (item.tone && !colourFits(ctx, item.tone, rects)) continue;
        if (want.colour && !colourFits(ctx, want.colour, rects)) continue;
        return { boxes, rects, slot: { col, row, span } };
      }
    }
  }
  return null;
}

const commit = (ctx: Context, zone: ZoneDef, p: Placement) => {
  ctx.taken.push(...p.rects);
  for (let i = 0; i < p.slot.span; i++) ctx.cells.add(cellKey(zone.id, p.slot.col, p.slot.row + i));
};

/** Bigger things first, so small ones fill the gaps. */
const footprint = (item: ItemDef, count = 1) => item.size * item.size * (item.h / item.w) * count;

/** How many kinds each band should get: shares of `total` by band height (largest remainders), at least 1 and `minGroups`. */
function shares(recipe: Recipe, total: number): { zone: ZoneDef; quota: number }[] {
  const zones = recipe.zones.filter((z) => z.rows > 0);
  const span = zones.reduce((n, z) => n + z.bottom - z.top, 0);
  const exact = zones.map((z) => (total * (z.bottom - z.top)) / span);
  const quotas = exact.map((e, i) => Math.max(1, zones[i].minGroups ?? 0, Math.floor(e)));
  const order = exact.map((e, i) => i).sort((a, b) => (exact[b] % 1) - (exact[a] % 1));
  for (const i of order) if (quotas.reduce((a, b) => a + b, 0) < total) quotas[i]++;
  return zones.map((zone, i) => ({ zone, quota: quotas[i] }));
}

/** Fills a recipe with random contents and lays them out once. */
function build(recipe: Recipe, knobs: SceneKnobs, seed: number, rng: Rng, size: SceneSize): SceneSpec {
  const ratio = ratioOf(size);
  const variant = rng.pick(recipe.variants);
  const ctx: Context = { recipe, variant, ratio, size, rng, taken: [], cells: new Set() };
  const pool = rng.shuffle(recipe.items);
  const groups: PlacedGroup[] = [];

  /** Places one kind (optionally only in `onlyZone`, or with its centre in `third`). Returns false if it doesn't fit. */
  const tryItem = (item: ItemDef, onlyZone?: string, third?: number) => {
    const most = item.countable === false ? 1 : Math.min(item.maxCount, knobs.maxCount);
    const wanted = rng.int(1, most);
    for (const zoneId of rng.shuffle(item.zones)) {
      if (onlyZone && zoneId !== onlyZone) continue;
      const zone = recipe.zones.find((z) => z.id === zoneId)!;
      for (let count = wanted; count >= 1; count--) {
        const placed = place(ctx, { item, count, zone, third });
        if (!placed) continue;
        // Only colours that stand out from everything behind them.
        const colours: ColourDef[] | undefined = item.colours?.filter((c) => colourFits(ctx, c.hex, placed.rects));
        if (colours && !colours.length) continue;
        commit(ctx, zone, placed);
        groups.push({
          kind: item.kind,
          count,
          colour: colours ? rng.pick(colours) : undefined,
          zoneId: zone.id,
          region: REGIONS[placed.slot.col],
          slot: placed.slot,
          boxes: placed.boxes,
        });
        return true;
      }
    }
    return false;
  };
  const take = (item: ItemDef) => pool.splice(pool.indexOf(item), 1);

  // Each band gets its fair share of the kinds first, in proportion to its height (at least one, and at
  // least its `minGroups`), so no band is left empty while another is crowded.
  for (const { zone, quota } of rng.shuffle(shares(recipe, knobs.groups))) {
    let needed = quota;
    for (const item of pool.filter((i) => i.zones.includes(zone.id))) {
      if (needed <= 0 || groups.length >= knobs.groups) break;
      take(item);
      if (tryItem(item, zone.id)) needed--;
      else pool.push(item);
    }
  }

  // Then every third of the picture gets something to remember.
  for (const third of rng.shuffle([0, 1, 2])) {
    const covered = groups.some((g) => {
      const item = recipe.items.find((i) => i.kind === g.kind)!;
      const cy = centreOf(boundsOf(g.boxes.map((b) => rectOf(item, b, ratio)))).y / ratio;
      return cy >= third / 3 && cy < (third + 1) / 3;
    });
    if (covered || groups.length >= knobs.groups) continue;
    for (const item of [...pool]) {
      take(item);
      if (tryItem(item, undefined, third)) break;
      pool.push(item);
    }
  }

  // Then the rest, biggest first.
  const queue = pool.splice(0, Math.max(0, knobs.groups - groups.length)).sort((a, b) => footprint(b) - footprint(a));
  while (groups.length < knobs.groups && (queue.length || pool.length)) {
    // When a kind doesn't fit anywhere, the next unused kind gets a turn.
    tryItem(queue.length ? queue.shift()! : pool.shift()!);
  }

  return { id: `${recipe.id}-${seed.toString(36)}`, seed, recipeId: recipe.id, variantId: variant.id, size, groups };
}

/**
 * Fills a recipe with random contents laid out for a picture `size` points. Each layout is checked
 * with `validateScene`; one that fails is placed again (up to `LAYOUT_ATTEMPTS` times) and the best
 * one is returned. Same inputs, same scene.
 */
export function generateScene(recipe: Recipe, knobs: SceneKnobs, seed: number, size: SceneSize): SceneSpec {
  let best: { spec: SceneSpec; issues: number } | null = null;
  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const rng = createRng(seed + attempt * 0x9e3779b1);
    const spec = build(recipe, knobs, seed, rng, size);
    const issues = validateScene(spec, size.width, size.height).length;
    if (!issues) return spec;
    if (!best || issues < best.issues) best = { spec, issues };
  }
  return best!.spec;
}

/**
 * Lays the same contents out again for a picture of another size: every group keeps its kind,
 * count, colour, band and side (the facts the questions ask about); only the boxes move.
 * Returns null if it can't be done cleanly, so the caller keeps the original layout.
 */
export function relayoutScene(spec: SceneSpec, size: SceneSize): SceneSpec | null {
  const recipe = getRecipe(spec.recipeId);
  const variant = recipe.variants.find((v) => v.id === spec.variantId) ?? recipe.variants[0];
  const ratio = ratioOf(size);
  const order = [...spec.groups].sort(
    (a, b) => footprint(recipe.items.find((i) => i.kind === b.kind)!, b.count) - footprint(recipe.items.find((i) => i.kind === a.kind)!, a.count),
  );

  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const ctx: Context = { recipe, variant, ratio, size, rng: createRng(spec.seed + 7 + attempt * 0x85ebca6b), taken: [], cells: new Set() };
    const moved = new Map<PlacedGroup, PlacedGroup>();
    for (const group of order) {
      const item = recipe.items.find((i) => i.kind === group.kind)!;
      const zone = recipe.zones.find((z) => z.id === group.zoneId)!;
      const placed = place(ctx, { item, count: group.count, zone, col: REGIONS.indexOf(group.region), colour: group.colour?.hex });
      if (!placed) break;
      commit(ctx, zone, placed);
      moved.set(group, { ...group, slot: placed.slot, boxes: placed.boxes });
    }
    if (moved.size < spec.groups.length) continue;
    const next = { ...spec, size, groups: spec.groups.map((g) => moved.get(g)!) };
    if (!validateScene(next, size.width, size.height).length) return next;
  }
  return null;
}
