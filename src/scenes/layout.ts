/**
 * Layout rules and geometry shared by scene generation, validation and the debug overlay.
 *
 * Everything here works in "width units": x runs 0–1 across the picture and y runs 0–`ratio`
 * down it (ratio = height ÷ width), so sizes and gaps measured against the width mean the same
 * thing on every screen. Boxes are stored normalized (y as a fraction of the height) and
 * converted with `ratio`.
 */
import type { Box, ItemDef, Recipe, Rect, Region, Rug, SceneSize, ZoneDef } from './types';

/** Keep things at least this far from the left and right edges (fraction of the width). */
export const EDGE = 0.05;
/** Keep the bottom of the picture clear (fraction of the height): the home indicator lives there. */
export const BOTTOM_CLEAR = 0.04;
/** Tall anchors may rise to here at most (fraction of the height). */
export const TOP_CLEAR = 0.02;
/** Clear space between any two things (fraction of the width). */
export const GAP = 0.04;
/** Copies of a thing side by side or one above the other keep at least this gap (× their width)… */
export const DUPLICATE_GAP = 0.6;
/** …unless they are staggered: offset by at least half a width across and a quarter of a height down. */
export const STAGGER_X = 0.5;
export const STAGGER_Y = 0.25;
/** A group's centre stays this far from the lines between left / middle / right, so its side is never in doubt. */
export const THIRD_MARGIN = 0.05;
/** A group may reach this far past its third (fraction of the width) unless its band has `panels`. */
const SPILL = 0.03;
/** Nothing is drawn narrower than this on screen. */
export const MIN_POINTS = 44;

export const THIRDS: [number, number] = [1 / 3, 2 / 3];
export const REGIONS: Region[] = ['left', 'centre', 'right'];

export function regionOf(centreX: number): Region {
  return centreX < THIRDS[0] ? 'left' : centreX < THIRDS[1] ? 'centre' : 'right';
}

/** Width of a thing (fraction of the picture width): its tier size, but never under 44 pt. */
export const itemWidth = (item: ItemDef, size: SceneSize) => Math.max(item.size, MIN_POINTS / Math.max(1, size.width));

/** Height in width units for a thing `w` wide. */
export const heightFor = (item: ItemDef, w: number) => (w * item.h) / item.w;

/** A placed box in width units. */
export const rectOf = (item: ItemDef, box: Box, ratio: number): Rect => ({
  x0: box.x,
  y0: box.y * ratio,
  x1: box.x + box.w,
  y1: box.y * ratio + heightFor(item, box.w),
});

/** Space between two rects: positive when they are apart (the larger of the horizontal and vertical gaps). */
export const gapBetween = (a: Rect, b: Rect) => Math.max(a.x0 - b.x1, b.x0 - a.x1, a.y0 - b.y1, b.y0 - a.y1);

export const centreOf = (r: Rect) => ({ x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2 });

export const boundsOf = (rects: Rect[]): Rect => ({
  x0: Math.min(...rects.map((r) => r.x0)),
  y0: Math.min(...rects.map((r) => r.y0)),
  x1: Math.max(...rects.map((r) => r.x1)),
  y1: Math.max(...rects.map((r) => r.y1)),
});

/**
 * Two copies of the same thing are fine if they are clearly apart (a gap of 0.6 × their width), or
 * staggered diagonally (offset both across and down) without touching. Never touching in a tight line.
 */
export function duplicatesOk(a: Rect, b: Rect): boolean {
  const w = a.x1 - a.x0;
  const h = a.y1 - a.y0;
  const gap = gapBetween(a, b);
  if (gap >= DUPLICATE_GAP * w - 1e-9) return true;
  const ca = centreOf(a);
  const cb = centreOf(b);
  const staggered = Math.abs(ca.x - cb.x) >= STAGGER_X * w - 1e-9 && Math.abs(ca.y - cb.y) >= STAGGER_Y * h - 1e-9;
  return staggered && gap >= GAP - 1e-9;
}

/** The band's usable top and bottom in width units (the top 2% and bottom 4% of the picture stay clear). */
export function zoneBounds(zone: ZoneDef, ratio: number) {
  return { top: Math.max(zone.top, TOP_CLEAR) * ratio, bottom: Math.min(zone.bottom, 1 - BOTTOM_CLEAR) * ratio };
}

/** Top and bottom of each slot row of a band, in width units. */
export function rowsOf(zone: ZoneDef, ratio: number): { top: number; bottom: number }[] {
  const { top, bottom } = zoneBounds(zone, ratio);
  const sizes = zone.rowSizes ?? Array.from({ length: zone.rows }, () => 1);
  const total = sizes.reduce((a, b) => a + b, 0);
  let y = top;
  return sizes.map((s) => {
    const row = { top: y, bottom: y + ((bottom - top) * s) / total };
    y = row.bottom;
    return row;
  });
}

/**
 * Left and right limits for a group in column `col` (0 = left third), in width units. Wide things
 * (a bus) may use the whole width as long as their centre stays in the column's third.
 */
export function columnBounds(zone: ZoneDef, col: number, wide = false) {
  const t0 = col / 3;
  const t1 = (col + 1) / 3;
  const inset = zone.panels ? -0.02 : SPILL;
  const centre = { centreMin: t0 + THIRD_MARGIN, centreMax: t1 - THIRD_MARGIN };
  if (wide) return { x0: EDGE, x1: 1 - EDGE, ...centre };
  return { x0: Math.max(EDGE, t0 - inset), x1: Math.min(1 - EDGE, t1 + inset), ...centre };
}

/** The columns (thirds) a rect really covers: more than the small spill allowed past a third's edge. */
export function columnsCovered(r: Rect): number[] {
  return [0, 1, 2].filter((c) => Math.min(r.x1, (c + 1) / 3) - Math.max(r.x0, c / 3) > SPILL + 1e-9);
}

/** True if the rect covers any of the recipe's keep-clear areas (building doors). */
export function coversKeepClear(r: Rect, recipe: Recipe, ratio: number): boolean {
  return (recipe.keepClear ?? []).some((k) => gapBetween(r, { x0: k.x0, y0: k.y0 * ratio, x1: k.x1, y1: k.y1 * ratio }) < 0.01);
}

/** How far the copies' bottoms differ, as a fraction of their height: 0 means standing on one line. */
export function baseSpread(rects: Rect[]): number {
  const h = rects[0].y1 - rects[0].y0;
  return (Math.max(...rects.map((r) => r.y1)) - Math.min(...rects.map((r) => r.y1))) / h;
}

/** Things on the ground may step back a little from each other, but never stack up like a ladder. */
export const MAX_GROUND_STEP = 0.45;

/** True if the rect touches the rug at all. */
export function touchesRug(r: Rect, rug: Rug, ratio: number): boolean {
  const cx = rug.cx;
  const cy = rug.cy * ratio;
  const rx = rug.rx;
  const ry = rug.ry * ratio;
  // Closest point of the rect to the rug's centre, measured with the oval stretched into a circle.
  const px = Math.min(Math.max(cx, r.x0), r.x1);
  const py = Math.min(Math.max(cy, r.y0), r.y1);
  return ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1;
}

/** True if the whole rect is on the rug. */
export function insideRug(r: Rect, rug: Rug, ratio: number): boolean {
  const inside = (x: number, y: number) => ((x - rug.cx) / rug.rx) ** 2 + ((y - rug.cy * ratio) / (rug.ry * ratio)) ** 2 <= 1;
  return inside(r.x0, r.y0) && inside(r.x1, r.y0) && inside(r.x0, r.y1) && inside(r.x1, r.y1);
}

/** Either fully on the rug or clear of it (and always clear of it for things that avoid rugs). */
export function rugOk(item: ItemDef, r: Rect, recipe: Recipe, ratio: number): boolean {
  if (!recipe.rug || !touchesRug(r, recipe.rug, ratio)) return true;
  return !item.avoidRug && insideRug(r, recipe.rug, ratio);
}

/** Points sampled inside a rect to find every surface it is drawn over (fractions of width and height). */
export function samplePoints(r: Rect, ratio: number): [number, number][] {
  const pts: [number, number][] = [];
  for (const fx of [0.2, 0.5, 0.8]) {
    for (const fy of [0.2, 0.5, 0.8]) pts.push([r.x0 + (r.x1 - r.x0) * fx, (r.y0 + (r.y1 - r.y0) * fy) / ratio]);
  }
  return pts;
}

/**
 * Ways to arrange `n` copies of a thing `w` × `h`, as offsets of each copy's top-left corner.
 * Every arrangement keeps copies apart by the duplicate rule: a row or column with wide gaps, a
 * zigzag, a diagonal, an arc, or two staggered rows.
 */
export function arrangements(n: number, w: number, h: number): { offsets: [number, number][]; straight: boolean }[] {
  if (n === 1) return [{ offsets: [[0, 0]], straight: false }];
  const wide = w * (1 + DUPLICATE_GAP);
  const clearX = w + GAP;
  const clearY = h + GAP;
  const list: { offsets: [number, number][]; straight: boolean }[] = [];
  const make = (f: (i: number) => [number, number], straight = false) => list.push({ offsets: Array.from({ length: n }, (_, i) => f(i)), straight });

  // Straight lines with wide gaps: allowed, but only used when nothing staggered fits.
  make((i) => [i * wide, 0], true);
  make((i) => [0, i * (h + DUPLICATE_GAP * w)], true);
  // Zigzag across: side by side with a gap, every other one a little lower.
  make((i) => [i * clearX, (i % 2) * Math.max(STAGGER_Y, 0.4) * h]);
  // Zigzag down: two columns, each copy lower than the last.
  const down = Math.max(STAGGER_Y * h, (h + DUPLICATE_GAP * w) / 2);
  make((i) => [(i % 2) * clearX, i * down]);
  // Diagonals, rising and falling.
  make((i) => [i * clearX, i * Math.max(STAGGER_Y, 0.3) * h]);
  make((i) => [i * clearX, (n - 1 - i) * Math.max(STAGGER_Y, 0.3) * h]);
  make((i) => [i * STAGGER_X * 1.1 * w, i * clearY]);
  make((i) => [(n - 1 - i) * STAGGER_X * 1.1 * w, i * clearY]);
  // An arc (odd counts): the middle one highest.
  if (n % 2 === 1) make((i) => [i * clearX, Math.abs(i - (n - 1) / 2) * 0.35 * h]);
  // Two staggered rows, like bricks.
  if (n >= 3) {
    const top = Math.ceil(n / 2);
    make((i) => (i < top ? [i * wide, 0] : [(i - top) * wide + wide / 2, clearY]));
  }

  // Keep only arrangements where every pair of copies passes the rule (the formulas above should all pass).
  return list.filter(({ offsets }) => {
    const rects = offsets.map(([x, y]) => ({ x0: x, y0: y, x1: x + w, y1: y + h }));
    return rects.every((a, i) => rects.every((b, j) => j <= i || duplicatesOk(a, b)));
  });
}
