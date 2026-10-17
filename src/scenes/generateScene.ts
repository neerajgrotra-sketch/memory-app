import { standsOut, surfaceColour } from './contrast';
import type { ClockStep } from './clock';
import {
  AGAINST_BACK,
  AT_FRONT,
  GAP,
  REGIONS,
  TOP_CLEAR,
  MAX_GROUND_STEP,
  arrangements,
  boundsOf,
  centreOf,
  columnBounds,
  columnsCovered,
  coversKeepClear,
  duplicatesOk,
  gapBetween,
  heightFor,
  itemWidth,
  rectOf,
  regionOf,
  rowsOf,
  rugOk,
  samplePoints,
  zoneBounds,
} from './layout';
import { createRng, type Rng } from './random';
import { getRecipe } from './recipes';
import { ratioOf, type Box, type ColourDef, type ItemDef, type PlacedGroup, type Recipe, type Rect, type SceneSize, type SceneSpec, type Slot, type VariantDef, type ZoneDef } from './types';
import { validateScene } from './validateScene';
import { variantOf } from './variant';

export interface SceneKnobs {
  /** How many different kinds of thing appear. */
  groups: number;
  /** Most of any one kind. */
  maxCount: number;
  /** Copies of things with `mixedColours` may each be a different colour. */
  mixedColours?: boolean;
  /** How exact clock times are (whole hours when missing). */
  clockStep?: ClockStep;
}

/** Fresh placements tried before showing the best one found. */
export const LAYOUT_ATTEMPTS = 12;
/** How far a spread copy may sit from the middle of its third (fraction of the width). */
const SPREAD_JITTER = 0.07;
/** Hung things this high (width units above the band's bottom) use the wall's top row of slots. */
const HIGH_HANG = 0.45;
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
  /** Whether things in one-way bands are drawn mirrored. */
  oneWayFlip: boolean;
}

const cellKey = (zone: string, col: number, row: number) => `${zone}:${col}:${row}`;

/**
 * Which way a thing faces. In a one-way band (a road) everything faces the same way, fixed by the
 * scene's seed so laying the scene out again keeps it; elsewhere each thing faces either way.
 */
/** Which way a thing faces. Things that must read correctly (a clock face) are never mirrored. */
const facing = (ctx: Context, zone: ZoneDef, item: ItemDef) => {
  const flip = zone.oneWay ? ctx.oneWayFlip : ctx.rng.next() < 0.5;
  return flip && !item.noFlip;
};

/** True if `colour` stands out from every surface each rect is drawn over. */
const colourFits = (ctx: Context, colour: string, rects: Rect[]) =>
  rects.every((r) => samplePoints(r, ctx.ratio).every(([x, y]) => standsOut(colour, surfaceColour(ctx.recipe, ctx.variant.palette, x, y))));

interface Placement {
  boxes: Box[];
  rects: Rect[];
  slot: Slot;
  /** Slot-grid cells the group uses. */
  cells: string[];
}

interface Want {
  item: ItemDef;
  count: number;
  zone: ZoneDef;
  /** Only this column (when laying out again, the side is a fact that must not change). */
  col?: number;
  /** Only where the group's centre falls in this third of the height. */
  third?: number;
  /** Fixed colours (laying out again) that must still stand out where they go: one, or one per copy. */
  colour?: string | string[];
}

/** Everything a candidate group must pass besides its slot: clearances, rug, doors, contrast. */
function clearToPlace(ctx: Context, want: Want, rects: Rect[]): boolean {
  const { item } = want;
  if (rects.some((r) => ctx.taken.some((t) => gapBetween(r, t) < GAP))) return false;
  if (rects.some((r) => !rugOk(item, r, ctx.recipe, ctx.ratio))) return false;
  if (rects.some((r) => coversKeepClear(r, ctx.recipe, ctx.ratio))) return false;
  if (item.tone && !colourFits(ctx, item.tone, rects)) return false;
  if (typeof want.colour === 'string' && !item.framedColour && !colourFits(ctx, want.colour, rects)) return false;
  if (Array.isArray(want.colour) && !rects.every((r, i) => colourFits(ctx, (want.colour as string[])[i], [r]))) return false;
  if (want.third !== undefined) {
    const cy = centreOf(boundsOf(rects)).y / ctx.ratio;
    if (cy < want.third / 3 || cy >= (want.third + 1) / 3) return false;
  }
  return true;
}

/**
 * Where a group `bh` tall goes vertically in rows `top`…`bottom` (width units), following the
 * thing's habits. Returns the top of the group, or null if it can't go there.
 */
function verticalSpot(ctx: Context, item: ItemDef, zone: ZoneDef, top: number, bottom: number, bh: number): number | null {
  const { rng, ratio } = ctx;
  const band = zoneBounds(zone, ratio);
  if (item.hangAt !== undefined) {
    // Hung on the band's eye-level line (a clock above it), with only a tiny wobble.
    const y0 = band.bottom - item.hangAt - bh / 2 + (rng.next() - 0.5) * 0.02;
    return y0 >= band.top && y0 + bh <= band.bottom ? y0 : null;
  }
  const rowH = bottom - top;
  if (item.tall || item.backRow) {
    // Against the back: feet just in front of where the band starts (where the floor meets the wall, or
    // the shoreline), and the thing rises over what's behind it, like real furniture against a wall.
    const y0 = top + rowH * (AGAINST_BACK[0] + (AGAINST_BACK[1] - AGAINST_BACK[0]) * rng.next()) - bh;
    return y0 >= TOP_CLEAR * ratio ? y0 : null;
  }
  if (bh > rowH) return null;
  if (zone.flush) return bottom - bh;
  // At the front edge (a fire hydrant at the kerb).
  if (item.frontRow) return bottom - bh - (rowH - bh) * AT_FRONT * rng.next();
  // On the ground: towards the bottom of the row. In the air or on a wall: anywhere in it.
  return top + (rowH - bh) * (zone.surface === 'ground' ? 1 - 0.35 * rng.next() : rng.next());
}

/**
 * Copies of things that spread out (street lamps, palm trees, flags on roofs, armchairs along a wall):
 * one per column, all standing on the same line.
 */
function placeSpread(ctx: Context, want: Want): Placement | null {
  const { item, count, zone } = want;
  const { rng, ratio } = ctx;
  const w = itemWidth(item, ctx.size);
  const h = heightFor(item, w);
  const rows = rowsOf(zone, ratio);
  const rowIndex = item.frontRow || (item.hangAt !== undefined && item.hangAt < HIGH_HANG) ? rows.length - 1 : 0;
  if (!rows[rowIndex]) return null;
  // Things standing on the ground that are taller than one row (street lamps) use the band's full depth.
  const fullBand = zone.surface === 'ground' && !item.tall && !item.backRow && h > rows[rowIndex].bottom - rows[rowIndex].top;
  const usedRows = fullBand ? rows.map((_, i) => i) : [rowIndex];
  const row = { top: rows[usedRows[0]].top, bottom: rows[usedRows[usedRows.length - 1]].bottom };
  const cellsOf = (c: number) => usedRows.map((r) => cellKey(zone.id, c, r));
  const free = [0, 1, 2].filter((c) => cellsOf(c).every((k) => !ctx.cells.has(k)));
  if (free.length < count) return null;

  for (let attempt = 0; attempt < JITTERS * 4; attempt++) {
    // Two copies go at opposite ends (left and right thirds) when both are free, as far apart as possible.
    const cols = count === 2 && free.includes(0) && free.includes(2) && attempt < JITTERS * 2 ? [0, 2] : rng.shuffle(free).slice(0, count).sort();
    const y0 = verticalSpot(ctx, item, zone, row.top, row.bottom, h);
    if (y0 === null) return null;
    // Each copy stands near the middle of its third, so neighbours never end up side by side at a boundary.
    const spans = cols.map((col) => {
      const b = columnBounds(zone, col);
      const mid = (col + 0.5) / 3;
      return [Math.max(b.x0, b.centreMin - w / 2, mid - SPREAD_JITTER - w / 2), Math.min(b.x1 - w, b.centreMax - w / 2, mid + SPREAD_JITTER - w / 2)];
    });
    if (spans.some(([lo, hi]) => hi < lo)) return null;
    const boxes = spans.map(([lo, hi]) => ({ x: lo + (hi - lo) * rng.next(), y: y0 / ratio, w, flip: facing(ctx, zone, item) }));
    const rects = boxes.map((b) => rectOf(item, b, ratio));
    if (rects.some((r, i) => rects.some((q, j) => j > i && !duplicatesOk(r, q)))) continue;
    if (!clearToPlace(ctx, want, rects)) continue;
    return { boxes, rects, slot: { col: cols[0], row: usedRows[0], span: usedRows.length }, cells: cols.flatMap(cellsOf) };
  }
  return null;
}

/**
 * Finds a slot for `count` copies of a thing in one band: each group gets its own cells of the
 * slot grid (one column, one or more rows), with a little jitter inside them. Null if nowhere fits.
 */
function place(ctx: Context, want: Want): Placement | null {
  const { item, count, zone } = want;
  if (item.spread && count > 1) return placeSpread(ctx, want);
  const { rng, ratio } = ctx;
  const w = itemWidth(item, ctx.size);
  const h = heightFor(item, w);
  const rows = rowsOf(zone, ratio);
  if (!rows.length) return null;
  const cols = want.col === undefined ? [0, 1, 2] : [want.col];
  const firstRowOnly = item.tall || item.backRow;
  const hung = item.hangAt !== undefined;

  // Candidate cells: one column, one or more rows. Fewest rows first, then the emptiest parts of
  // the picture, so things spread out instead of bunching up. Hung things use the whole band height.
  const used = (zoneId: string, col: number, row: number): number => (ctx.cells.has(cellKey(zoneId, col, row)) ? 1 : 0);
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  const crowding = (col: number, row: number) =>
    sum(rows.map((_, r) => used(zone.id, col, r))) +
    sum([0, 1, 2].map((c) => used(zone.id, c, row))) +
    sum(ctx.recipe.zones.flatMap((z) => Array.from({ length: z.rows }, (_, r) => used(z.id, col, r)))) / 2;
  const candidates: { row: number; span: number; col: number; score: number }[] = [];
  for (let span = 1; span <= (firstRowOnly || hung || item.frontRow ? 1 : rows.length); span++) {
    for (let row = 0; row < rows.length; row++) {
      if (firstRowOnly && row !== 0) continue;
      if (item.frontRow && row !== rows.length - 1) continue;
      // Hung things take the top row if they hang high (a clock), else the bottom one (eye level).
      if (hung && row !== (item.hangAt! >= HIGH_HANG ? 0 : rows.length - 1)) continue;
      if (row + span > rows.length) continue;
      for (const col of cols) candidates.push({ row, span, col, score: span * 10 + crowding(col, row) + rng.next() * 1.5 });
    }
  }
  candidates.sort((a, b) => a.score - b.score);

  // Hung things share one level; things on the ground stand side by side, never stacked like a ladder.
  const all = arrangements(count, w, h, item.lineUp).filter(({ offsets }) => {
    const step = (Math.max(...offsets.map(([, y]) => y)) - Math.min(...offsets.map(([, y]) => y))) / h;
    // Hung things and things against the back stand on one line; other ground things may step back a little.
    return hung || item.backRow || item.lineUp ? step < 1e-9 : zone.surface === 'ground' ? step <= MAX_GROUND_STEP : true;
  });

  for (const { row, span, col } of candidates) {
    const bounds = columnBounds(zone, col, item.wide);
    const top = rows[row].top;
    const bottom = rows[row + span - 1].bottom;

    // Staggered arrangements (zigzags, diagonals, arcs) first; straight rows and columns only if nothing else fits.
    const ordered = [...rng.shuffle(all.filter((a) => !a.straight)), ...rng.shuffle(all.filter((a) => a.straight))];
    for (const { offsets } of ordered) {
      const bw = Math.max(...offsets.map(([x]) => x)) + w;
      const bh = Math.max(...offsets.map(([, y]) => y)) + h;
      const xMin = Math.max(bounds.x0, bounds.centreMin - bw / 2);
      const xMax = Math.min(bounds.x1 - bw, bounds.centreMax - bw / 2);
      if (xMax < xMin) continue;

      for (let j = 0; j < JITTERS; j++) {
        const y0 = verticalSpot(ctx, item, zone, top, bottom, bh);
        if (y0 === null) break;
        const x0 = xMin + (xMax - xMin) * rng.next();
        const boxes = offsets.map(([dx, dy]) => ({ x: x0 + dx, y: (y0 + dy) / ratio, w, flip: facing(ctx, zone, item) }));
        const rects = boxes.map((b) => rectOf(item, b, ratio));
        const group = boundsOf(rects);
        if (regionOf(centreOf(group).x) !== REGIONS[col]) continue;
        // Every column the group really covers must be free in its rows (a bus takes more than one).
        const covered = [...new Set([col, ...columnsCovered(group)])];
        const cells = covered.flatMap((c) => Array.from({ length: span }, (_, i) => cellKey(zone.id, c, row + i)));
        if (cells.some((c) => ctx.cells.has(c))) continue;
        if (!clearToPlace(ctx, want, rects)) continue;
        return { boxes, rects, slot: { col, row, span }, cells };
      }
    }
  }
  return null;
}

const commit = (ctx: Context, p: Placement) => {
  ctx.taken.push(...p.rects);
  p.cells.forEach((c) => ctx.cells.add(c));
};

/** Bigger things first, so small ones fill the gaps. */
const footprint = (item: ItemDef, count = 1) => item.size * item.size * (item.h / item.w) * count;

/** How many kinds each band should get: shares of `total` by band height (largest remainders), at least 1 and `minGroups`, at most `maxGroups`. */
function shares(recipe: Recipe, total: number): { zone: ZoneDef; quota: number }[] {
  const zones = recipe.zones.filter((z) => z.rows > 0);
  const span = zones.reduce((n, z) => n + z.bottom - z.top, 0);
  const exact = zones.map((z) => (total * (z.bottom - z.top)) / span);
  const cap = (i: number) => zones[i].maxGroups ?? Infinity;
  const quotas = exact.map((e, i) => Math.min(cap(i), Math.max(1, zones[i].minGroups ?? 0, Math.floor(e))));
  const order = exact.map((e, i) => i).sort((a, b) => (exact[b] % 1) - (exact[a] % 1));
  // Hand out what's left by largest remainder, skipping bands that are full.
  for (let round = 0; round < total && quotas.reduce((a, b) => a + b, 0) < total; round++) {
    for (const i of order) if (quotas.reduce((a, b) => a + b, 0) < total && quotas[i] < cap(i)) quotas[i]++;
  }
  return zones.map((zone, i) => ({ zone, quota: quotas[i] }));
}

/** Fills a recipe with random contents and lays them out once. */
function build(recipe: Recipe, knobs: SceneKnobs, seed: number, rng: Rng, size: SceneSize): SceneSpec {
  const ratio = ratioOf(size);
  const base = rng.pick(recipe.variants);
  const details = recipe.details?.(rng, { clockStep: knobs.clockStep ?? 60 });
  const variant = variantOf(recipe, { variantId: base.id, details });
  const ctx: Context = { recipe, variant, ratio, size, rng, taken: [], cells: new Set(), oneWayFlip: (seed & 1) === 1 };
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
        // Only colours that stand out from everything behind them (or any, for a colour on its own frame).
        const colours: ColourDef[] | undefined = item.colours?.filter((c) => item.framedColour || colourFits(ctx, c.hex, placed.rects));
        if (colours && !colours.length) continue;
        // On levels that allow it, half the time copies of some things each get their own colour (at least two different).
        let perCopy: ColourDef[] | undefined;
        if (knobs.mixedColours && item.mixedColours && item.colours && count > 1 && rng.next() < 0.5) {
          const options = placed.rects.map((r) => item.colours!.filter((c) => item.framedColour || colourFits(ctx, c.hex, [r])));
          const picked = options.map((o) => rng.pick(o.length ? o : item.colours!));
          if (new Set(picked.map((c) => c.name)).size < 2) {
            const other = options[1].find((c) => c.name !== picked[0].name);
            if (other) picked[1] = other;
          }
          if (new Set(picked.map((c) => c.name)).size >= 2 && picked.every((c, i) => options[i].includes(c))) perCopy = picked;
        }
        commit(ctx, placed);
        groups.push({
          kind: item.kind,
          count,
          colour: perCopy ? undefined : colours ? rng.pick(colours) : undefined,
          colours: perCopy,
          zoneId: zone.id,
          // Spread copies have no single side; the questions don't ask where they were.
          region: item.spread && count > 1 ? regionOf(centreOf(boundsOf(placed.rects)).x) : REGIONS[placed.slot.col],
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
  // least its `minGroups`), so no band is left empty while another is crowded. The kinds are picked first,
  // then placed biggest first (furniture against the wall before the toys in front of it).
  const chosen: { item: ItemDef; zone: ZoneDef }[] = [];
  for (const { zone, quota } of shares(recipe, knobs.groups)) {
    let left = quota;
    let wide = false;
    // Anchors the band asks for come first (a room's furniture), always leaving room for at least one
    // thing out in front of them; the rest of the band's share goes to things that aren't anchors.
    const here = pool.filter((i) => i.zones.includes(zone.id));
    const isAnchor = (i: ItemDef) => !!(i.tall || i.backRow || i.wide);
    const anchorsFirst = zone.anchors
      ? [...here.filter(isAnchor).slice(0, Math.min(zone.anchors, quota - 1)), ...here.filter((i) => !isAnchor(i))]
      : here;
    for (const item of [...new Set(anchorsFirst)]) {
      // Only one extra-wide kind per band: two buses' worth of vehicles can't share one lane.
      if (left <= 0 || (item.wide && wide)) continue;
      wide ||= !!item.wide;
      take(item);
      chosen.push({ item, zone });
      left--;
    }
  }
  const anchored = (i: ItemDef) => (i.tall || i.backRow || i.wide ? 1 : 0);

  chosen.sort((a, b) => anchored(b.item) - anchored(a.item) || footprint(b.item) - footprint(a.item));
  for (const { item, zone } of chosen) {
    if (groups.length >= knobs.groups || tryItem(item, zone.id)) continue;
    // Didn't fit: give the band another (not extra-wide) kind instead.
    for (const other of pool.filter((i) => i.zones.includes(zone.id) && !i.wide)) {
      take(other);
      if (tryItem(other, zone.id)) break;
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

  return { id: `${recipe.id}-${seed.toString(36)}`, seed, recipeId: recipe.id, variantId: variant.id, details, size, groups };
}

/**
 * Fills a recipe with random contents laid out for a picture `size` points. Each layout is checked
 * with `validateScene`; one that fails, or that couldn't fit every kind, is placed again (up to
 * `LAYOUT_ATTEMPTS` times) and the best one is returned. Same inputs, same scene.
 */
export function generateScene(recipe: Recipe, knobs: SceneKnobs, seed: number, size: SceneSize): SceneSpec {
  // Keep the best layout: fewest problems first, then the most kinds. A clean, full one ends the search.
  let best: { spec: SceneSpec; issues: number } | null = null;
  const better = (spec: SceneSpec, issues: number) =>
    !best || issues < best.issues || (issues === best.issues && spec.groups.length > best.spec.groups.length);
  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const rng = createRng(seed + attempt * 0x9e3779b1);
    const spec = build(recipe, knobs, seed, rng, size);
    const issues = validateScene(spec, size.width, size.height).length;
    if (!issues && spec.groups.length >= knobs.groups) return spec;
    if (better(spec, issues)) best = { spec, issues };
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
  const variant = variantOf(recipe, spec);
  const ratio = ratioOf(size);
  const order = [...spec.groups].sort(
    (a, b) => footprint(recipe.items.find((i) => i.kind === b.kind)!, b.count) - footprint(recipe.items.find((i) => i.kind === a.kind)!, a.count),
  );

  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const ctx: Context = { recipe, variant, ratio, size, rng: createRng(spec.seed + 7 + attempt * 0x85ebca6b), taken: [], cells: new Set(), oneWayFlip: (spec.seed & 1) === 1 };
    const moved = new Map<PlacedGroup, PlacedGroup>();
    for (const group of order) {
      const item = recipe.items.find((i) => i.kind === group.kind)!;
      const zone = recipe.zones.find((z) => z.id === group.zoneId)!;
      const spread = item.spread && group.count > 1;
      const placed = place(ctx, { item, count: group.count, zone, col: spread ? undefined : REGIONS.indexOf(group.region), colour: group.colours ? group.colours.map((c) => c.hex) : group.colour?.hex });
      if (!placed) break;
      commit(ctx, placed);
      moved.set(group, { ...group, slot: placed.slot, boxes: placed.boxes, region: spread ? regionOf(centreOf(boundsOf(placed.rects)).x) : group.region });
    }
    if (moved.size < spec.groups.length) continue;
    const next = { ...spec, size, groups: spec.groups.map((g) => moved.get(g)!) };
    if (!validateScene(next, size.width, size.height).length) return next;
  }
  return null;
}
