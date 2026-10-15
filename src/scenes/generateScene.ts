import { MIN_CONTRAST, contrast } from './contrast';
import { createRng, type Rng } from './random';
import {
  SCENE_WIDTH,
  heightFactor,
  type Box,
  type Fixture,
  type ItemDef,
  type Mount,
  type PlacedDecor,
  type PlacedGroup,
  type Recipe,
  type Region,
  type VariantDef,
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

const hits = (a: Rect, b: Rect, pad = PAD) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;

/** Everything placement needs to know about the scene being built. */
interface Context {
  recipe: Recipe;
  variant: VariantDef;
  height: number;
  rng: Rng;
  /** Things already placed; `wall` marks things hung on a wall, which keep a wider gap between them. */
  taken: { rect: Rect; wall: boolean }[];
  /** Windows and doors: nothing is hung over them. */
  openings: Rect[];
  /** Clouds and other scenery, placed first: sky things never overlap them. */
  scenery: { rect: Rect; colour: string }[];
  rugs: Extract<Fixture, { kind: 'rug' }>[];
  mounts: Mount[];
  usedMounts: Set<Mount>;
}

/**
 * True if any part of a thing would sit over a rug, even standing just in front of it, since that
 * reads as being on the rug. Things that avoid rugs end up by the wall or at the sides of the room.
 */
const overRug = (ctx: Context, r: Rect) =>
  ctx.rugs.some((rug) => hits(r, { x0: rug.cx - rug.rx, y0: rug.cy - rug.ry, x1: rug.cx + rug.rx, y1: rug.cy + rug.ry }, PAD * 2));

/** Colour of the surface behind the middle of a rect. */
const surfaceColour = (ctx: Context, r: Rect) =>
  ctx.variant.palette[ctx.recipe.surfaceAt((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, ctx.height)];

/** True if `colour` stands out from the surface behind every one of `rects`, and from any scenery they pass in front of. */
const standsOut = (ctx: Context, colour: string, rects: Rect[]) =>
  rects.every(
    (r) =>
      contrast(colour, surfaceColour(ctx, r)) >= MIN_CONTRAST &&
      ctx.scenery.every((sc) => !hits(r, sc.rect, 0) || contrast(colour, sc.colour) >= MIN_CONTRAST),
  );

/** Checks a candidate group against everything already in the scene and the item's own rules. */
function fits(ctx: Context, item: ItemDef, zone: ZoneDef, rects: Rect[]): boolean {
  const wall = zone.surface === 'wall';
  const wallPad = Math.max(PAD, (ctx.recipe.wallGapCm ?? 0) * zoneScale(ctx.recipe, zone, ctx.height));
  for (const r of rects) {
    if (r.y0 < TOP_MARGIN * ctx.height || r.y1 > ctx.height) return false;
    if (wall && ctx.openings.some((o) => hits(r, o))) return false;
    if (ctx.taken.some((t) => hits(r, t.rect, wall && t.wall ? wallPad : PAD))) return false;
    if (item.avoid?.includes('rug') && overRug(ctx, r)) return false;
    // A clear sky: nothing flying overlaps a cloud.
    if (zone.surface === 'air' && ctx.scenery.some((sc) => hits(r, sc.rect))) return false;
  }
  // Fixed-colour things only go where they stand out; coloured things get a colour that does (see tryItem).
  if (item.tone && !standsOut(ctx, item.tone, rects)) return false;
  return true;
}

interface Row {
  /** Ground: where feet stand. Air/wall: top of the row. */
  y: number;
  scale: number;
  count: number;
}

/** Works out the rows for a group at a random spot in the zone, or null if it can't go there. */
function planRows(ctx: Context, item: ItemDef, count: number, zone: ZoneDef): Row[] | null {
  const { recipe, height, rng } = ctx;
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

  const pxPerCm = zoneScale(recipe, zone, height);
  const scale = (pxPerCm * item.height) / item.h;
  const h = item.h * scale;
  if (h < MIN_VISIBLE) return null;
  const perRow = Math.max(1, Math.floor((usable + item.w * scale * (SPACING - 1)) / (item.w * scale * SPACING)));

  if (item.hangAt) {
    // Hung at its normal height: one row, centred somewhere in the item's height range above the wall's base.
    if (count > perRow) return null;
    const [lo, hi] = item.hangAt;
    const centreY = (zone.plane ?? zone.bottom) * height - (lo + (hi - lo) * rng.next()) * pxPerCm;
    return [{ y: centreY - h / 2 - (h * SPACING - h) / 2, scale, count }];
  }

  const rows = Math.ceil(count / perRow);
  const rowH = h * SPACING;
  if (rows * rowH > bottom - top) return null;
  const y0 = top + (bottom - top - rows * rowH) * rng.next();
  return Array.from({ length: rows }, (_, r) => ({
    y: y0 + r * rowH,
    scale,
    count: r === rows - 1 ? count - perRow * (rows - 1) : perRow,
  }));
}

type Placed = { boxes: Box[]; rects: Rect[]; region: Region; count: number; mounts?: Mount[] };

const clearOfThirds = (centre: number) => Math.abs(centre - THIRDS[0]) >= THIRD_MARGIN && Math.abs(centre - THIRDS[1]) >= THIRD_MARGIN;

/** Tries random spots for a group until one fits without breaking any rule. */
function placeGroup(ctx: Context, item: ItemDef, count: number, zone: ZoneDef, maxWidth = SCENE_WIDTH): Placed | null {
  const { rng } = ctx;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const rows = planRows(ctx, item, count, zone);
    if (!rows) continue;

    const cols = Math.max(...rows.map((r) => r.count));
    const widest = Math.max(...rows.map((r) => item.w * r.scale));
    const groupW = rowWidth(cols, widest);
    if (groupW > maxWidth) continue;

    let xMin = EDGE;
    let xMax = SCENE_WIDTH - EDGE;
    if (zone.panels) {
      const panels = zone.panels.filter(([p0, p1]) => p1 - p0 - 28 >= groupW);
      if (!panels.length) continue;
      const [p0, p1] = rng.pick(panels);
      xMin = p0 + 14;
      xMax = p1 - 14;
    }
    if (groupW > xMax - xMin) continue;

    const x0 = xMin + (xMax - xMin - groupW) * rng.next();
    const centre = x0 + groupW / 2;
    if (!clearOfThirds(centre)) continue;

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

    if (fits(ctx, item, zone, rects)) return { boxes, rects, region: regionOf(centre), count };
  }
  return null;
}

/**
 * Sky things that move on their own (planes, balloons, kites): each copy gets its own spot in one
 * third of the sky, its own size (some look further away) and direction, and never shares a line
 * with another copy.
 */
function placeScattered(ctx: Context, item: ItemDef, count: number, zone: ZoneDef): Placed | null {
  const { rng, height } = ctx;
  const base = (zoneScale(ctx.recipe, zone, height) * item.height) / item.h;
  const top = zone.top * height;
  const bottom = zone.bottom * height;

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const third = rng.int(0, 2);
    const x0 = third * THIRDS[0] + 15;
    const x1 = (third + 1) * THIRDS[0] - 15;
    const boxes: Box[] = [];
    const rects: Rect[] = [];

    for (let i = 0; i < count; i++) {
      for (let t = 0; t < 30; t++) {
        const scale = base * (0.75 + 0.4 * rng.next());
        const w = item.w * scale;
        const h = item.h * scale;
        if (h < MIN_VISIBLE || w > x1 - x0 || h > bottom - top) continue;
        const x = x0 + (x1 - x0 - w) * rng.next();
        const y = top + (bottom - top - h) * rng.next();
        const r = { x0: x, y0: y, x1: x + w, y1: y + h };
        const cy = y + h / 2;
        // Not in a row: every copy sits clearly higher or lower than the others.
        if (rects.some((o) => hits(r, o) || Math.abs((o.y0 + o.y1) / 2 - cy) < 0.6 * Math.max(h, o.y1 - o.y0))) continue;
        if (!fits(ctx, item, zone, [r])) continue;
        boxes.push({ x, y, scale, flip: rng.next() < 0.5 });
        rects.push(r);
        break;
      }
    }
    if (rects.length < count) continue;

    const centre = (Math.min(...rects.map((r) => r.x0)) + Math.max(...rects.map((r) => r.x1))) / 2;
    if (!clearOfThirds(centre)) continue;
    return { boxes, rects, region: regionOf(centre), count };
  }
  return null;
}

/** Things fixed to mounting points: a corner bracket (one per corner, up to both corners of a building) or a rooftop. */
function placeMounted(ctx: Context, item: ItemDef, count: number, zone: ZoneDef): Placed | null {
  const { rng } = ctx;
  const scale = (zoneScale(ctx.recipe, zone, ctx.height) * item.height) / item.h;
  const w = item.w * scale;
  const h = item.h * scale;
  if (h < MIN_VISIBLE) return null;
  const free = ctx.mounts.filter((m) => m.kind === item.mount && !ctx.usedMounts.has(m));

  for (const panel of rng.shuffle([...new Set(free.map((m) => m.panel))])) {
    const here = free.filter((m) => m.panel === panel);
    let boxes: Box[];
    let used: Mount[];

    if (item.mount === 'corner') {
      const corners = rng.shuffle(here).slice(0, Math.min(count, 2)) as Extract<Mount, { kind: 'corner' }>[];
      if (corners.length < count) continue;
      // The bracket touches the building edge; on a right-hand corner the drawing is mirrored.
      boxes = corners.map((m) => ({ x: m.side === 'left' ? m.x : m.x - w, y: m.y - h / 2, scale, flip: m.side === 'right' }));
      used = corners;
    } else {
      const roof = here[0] as Extract<Mount, { kind: 'roof' }>;
      const groupW = rowWidth(count, w);
      if (groupW > roof.x1 - roof.x0) continue;
      const x0 = roof.x0 + (roof.x1 - roof.x0 - groupW) * rng.next();
      boxes = Array.from({ length: count }, (_, i) => ({ x: x0 + i * w * SPACING, y: roof.y - h, scale }));
      used = [roof];
    }

    const rects = boxes.map((b) => ({ x0: b.x, y0: b.y, x1: b.x + w, y1: b.y + h }));
    const centre = (Math.min(...rects.map((r) => r.x0)) + Math.max(...rects.map((r) => r.x1))) / 2;
    if (!clearOfThirds(centre) || !fits(ctx, item, zone, rects)) continue;
    return { boxes, rects, region: regionOf(centre), count, mounts: used };
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
  const fixtures = recipe.fixtures?.(height) ?? [];
  // Scenery first, so sky things can keep clear of it.
  const decor = spreadDecor(recipe, height, rng);
  const ctx: Context = {
    recipe,
    variant,
    height,
    rng,
    taken: [],
    openings: fixtures.flatMap((f) => (f.kind === 'opening' ? [{ x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1 }] : [])),
    rugs: fixtures.flatMap((f) => (f.kind === 'rug' ? [f] : [])),
    scenery: decor.map((d) => {
      const def = recipe.decor!.find((x) => x.kind === d.kind)!;
      return {
        rect: { x0: d.box.x, y0: d.box.y, x1: d.box.x + def.w * d.box.scale, y1: d.box.y + def.h * d.box.scale },
        colour: def.colour,
      };
    }),
    mounts: recipe.mounts?.(height) ?? [],
    usedMounts: new Set(),
  };
  const groups: PlacedGroup[] = [];

  /**
   * Places one kind somewhere it belongs (optionally only in `onlyZone`, at most `maxWidth` wide).
   * Returns false if it doesn't fit.
   */
  const tryItem = (item: ItemDef, onlyZone?: string, maxWidth?: number) => {
    const most = item.countable === false ? 1 : Math.min(item.maxCount, knobs.maxCount);
    const wanted = rng.int(1, most);
    for (const zoneId of rng.shuffle(item.zones)) {
      if (onlyZone && zoneId !== onlyZone) continue;
      const zone = recipe.zones.find((z) => z.id === zoneId)!;
      for (let count = wanted; count >= 1; count--) {
        const placed = item.mount
          ? placeMounted(ctx, item, count, zone)
          : item.scatter && zone.surface === 'air'
            ? placeScattered(ctx, item, count, zone)
            : placeGroup(ctx, item, count, zone, maxWidth);
        if (!placed) continue;
        // Only colours that stand out from what's behind them.
        const colours = item.colours?.filter((c) => standsOut(ctx, c.hex, placed.rects));
        if (colours && !colours.length) continue;
        placed.mounts?.forEach((m) => ctx.usedMounts.add(m));
        ctx.taken.push(...placed.rects.map((rect) => ({ rect, wall: zone.surface === 'wall' })));
        groups.push({
          kind: item.kind,
          count,
          colour: colours ? rng.pick(colours) : undefined,
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
  // Each of those things takes at most its share of the width, so there is room for the others.
  for (const zone of recipe.zones) {
    let needed = zone.minGroups ?? 0;
    const share = (SCENE_WIDTH - 2 * EDGE) / Math.max(1, needed) - (recipe.wallGapCm ?? 0) * zoneScale(recipe, zone, height);
    for (const item of pool.filter((i) => i.zones.includes(zone.id))) {
      if (needed <= 0 || groups.length >= knobs.groups) break;
      pool.splice(pool.indexOf(item), 1);
      if (tryItem(item, zone.id, share)) needed--;
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
    decor,
  };
}
