import { G, Line } from 'react-native-svg';

import { gapBetween } from './layout';
import type { Mark, Rect } from './types';

/** Space kept between a mark and any thing's box (design units). */
const CLEARANCE = 8;

const clear = (r: Rect, boxes: Rect[]) => boxes.every((b) => gapBetween(r, b) >= CLEARANCE);

/** A mark of the given box, or nothing if it would touch any thing. */
export function markIfClear(r: Rect, boxes: Rect[], opacity: number, el: Mark['el']): Mark[] {
  return clear(r, boxes) ? [{ ...r, opacity, el }] : [];
}

/**
 * A horizontal line (a floorboard, the shoreline) broken wherever a thing stands on it, so it never
 * runs through anything.
 */
export function lineMarks(y: number, x0: number, x1: number, boxes: Rect[], stroke: string, width: number, opacity: number): Mark[] {
  const half = width / 2 + CLEARANCE;
  const blocked = boxes
    .filter((b) => b.y0 - half < y && y < b.y1 + half)
    .map((b) => [b.x0 - CLEARANCE * 2, b.x1 + CLEARANCE * 2] as const)
    .sort((a, b) => a[0] - b[0]);
  const marks: Mark[] = [];
  let from = x0;
  const push = (a: number, b: number) => {
    if (b - a < 12) return;
    marks.push({
      x0: a,
      y0: y - width / 2,
      x1: b,
      y1: y + width / 2,
      opacity,
      el: <Line key={`l-${y}-${a}`} x1={a} y1={y} x2={b} y2={y} stroke={stroke} strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" />,
    });
  };
  for (const [b0, b1] of blocked) {
    if (b0 > from) push(from, b0);
    from = Math.max(from, b1);
  }
  push(from, x1);
  return marks;
}

/**
 * Up to `count` copies of a mark `w` × `h` at random spots in an area, each clear of every thing and
 * of each other. `draw` gets the top-left corner.
 */
export function scatterMarks(
  area: Rect,
  w: number,
  h: number,
  count: number,
  boxes: Rect[],
  random: () => number,
  opacity: number,
  draw: (x: number, y: number) => Mark['el'],
  scenery = false,
): Mark[] {
  const marks: Mark[] = [];
  for (let tries = 0; tries < count * 12 && marks.length < count; tries++) {
    const x = area.x0 + (area.x1 - area.x0 - w) * random();
    const y = area.y0 + (area.y1 - area.y0 - h) * random();
    const r = { x0: x, y0: y, x1: x + w, y1: y + h };
    if (!clear(r, boxes) || marks.some((m) => gapBetween(r, m) < 20)) continue;
    marks.push({ ...r, opacity, scenery, el: <G key={`s-${marks.length}-${Math.round(x)}`} opacity={opacity}>{draw(x, y)}</G> });
  }
  return marks;
}
