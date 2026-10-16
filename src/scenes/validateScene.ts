import { standsOut } from './contrast';
import {
  AGAINST_BACK,
  AT_FRONT,
  BOTTOM_CLEAR,
  EDGE,
  GAP,
  MAX_GROUND_STEP,
  baseSpread,
  coversKeepClear,
  MIN_POINTS,
  THIRDS,
  THIRD_MARGIN,
  TOP_CLEAR,
  boundsOf,
  centreOf,
  columnBounds,
  duplicatesOk,
  gapBetween,
  rectOf,
  regionOf,
  rowsOf,
  rugOk,
  samplePoints,
  zoneBounds,
} from './layout';
import { createRng } from './random';
import { getRecipe } from './recipes';
import { variantOf } from './variant';
import { SCENE_WIDTH, TIERS, ratioOf, type ItemDef, type Mark, type PlacedGroup, type Recipe, type Rect, type SceneSpec } from './types';

export type Rule =
  | 'overlap'
  | 'size'
  | 'duplicates'
  | 'edges'
  | 'zone'
  | 'thirds'
  | 'side'
  | 'rug'
  | 'contrast'
  | 'marks'
  | 'placement'
  | 'count'
  | 'bare';

export interface SceneIssue {
  rule: Rule;
  message: string;
  /** Kinds of thing involved, so the debug overlay can mark them. */
  kinds: string[];
}

/** Opacity limit for backdrop marks, so they can't be mistaken for things. */
export const MAX_MARK_OPACITY = 0.35;

const EPS = 1e-6;

/** The faint backdrop marks of a scene, in design units, kept clear of every thing. Same scene, same marks. */
export function marksFor(spec: SceneSpec, recipe: Recipe, ratio: number): Mark[] {
  const variant = variantOf(recipe, spec);
  const boxes = spec.groups.flatMap((g) => {
    const item = recipe.items.find((i) => i.kind === g.kind)!;
    return g.boxes.map((b) => {
      const r = rectOf(item, b, ratio);
      return { x0: r.x0 * SCENE_WIDTH, y0: r.y0 * SCENE_WIDTH, x1: r.x1 * SCENE_WIDTH, y1: r.y1 * SCENE_WIDTH };
    });
  });
  const rng = createRng(spec.seed ^ 0x51ed27);
  return recipe.marks?.(ratio * SCENE_WIDTH, boxes, rng.next, variant) ?? [];
}

/**
 * Checks a laid-out scene against every layout rule for a picture `width` × `height` points.
 * An empty list means the scene is fine to show.
 */
export function validateScene(spec: SceneSpec, width: number, height: number): SceneIssue[] {
  const recipe = getRecipe(spec.recipeId);
  const ratio = ratioOf({ width, height });
  const variant = variantOf(recipe, spec);
  const issues: SceneIssue[] = [];
  const add = (rule: Rule, message: string, ...kinds: string[]) => {
    if (!issues.some((i) => i.message === message)) issues.push({ rule, message, kinds });
  };

  const itemOf = (kind: string) => recipe.items.find((i) => i.kind === kind)!;
  const placed: { group: PlacedGroup; item: ItemDef; rect: Rect }[] = spec.groups.flatMap((group) => {
    const item = itemOf(group.kind);
    return group.boxes.map((b) => ({ group, item, rect: rectOf(item, b, ratio) }));
  });

  for (const group of spec.groups) {
    const item = itemOf(group.kind);
    const zone = recipe.zones.find((z) => z.id === group.zoneId);
    const rects = placed.filter((p) => p.group === group).map((p) => p.rect);
    const name = item.plural;

    // Counts: the boxes are the facts the questions ask about.
    if (group.boxes.length !== group.count) add('count', `${name}: ${group.boxes.length} drawn but ${group.count} recorded`, item.kind);
    if (group.count > item.maxCount) add('count', `more ${name} than is realistic`, item.kind);
    if (!zone || !item.zones.includes(zone.id)) {
      add('zone', `${name} in a band they don't belong in`, item.kind);
      continue;
    }

    // Size: every copy the same size, inside its tier, never under 44 pt.
    const widths = group.boxes.map((b) => b.w);
    if (Math.max(...widths) - Math.min(...widths) > EPS) add('size', `${name} drawn at different sizes`, item.kind);
    const [lo, hi] = TIERS[item.tier];
    const minW = MIN_POINTS / width;
    for (const w of widths) {
      if (w * width < MIN_POINTS - 0.01) add('size', `${item.singular} under ${MIN_POINTS} pt wide`, item.kind);
      if (w < lo - EPS || (w > hi + EPS && w > minW + EPS)) add('size', `${item.singular} outside its ${item.tier} size`, item.kind);
    }

    // Spread copies: one per third, standing on one line. Hung copies: one level. Ground copies: no ladders.
    const spread = item.spread && group.count > 1;
    if (spread) {
      const thirds = new Set(rects.map((r) => regionOf(centreOf(r).x)));
      if (thirds.size < rects.length) add('placement', `${name} bunched together instead of spread out`, item.kind);
    }
    if (rects.length > 1) {
      const step = baseSpread(rects);
      if ((spread || item.hangAt !== undefined || item.lineUp) && step > EPS) add('placement', `${name} not on one line`, item.kind);
      else if (zone && zone.surface === 'ground' && step > MAX_GROUND_STEP + EPS) add('placement', `${name} stacked up instead of standing side by side`, item.kind);
    }

    // Copies apart, or staggered.
    for (let a = 0; a < rects.length; a++) {
      for (let b = a + 1; b < rects.length; b++) {
        if (!duplicatesOk(rects[a], rects[b], item.lineUp)) add('duplicates', `${name} too close together`, item.kind);
      }
    }

    // Band membership, edges, side.
    const { top, bottom } = zoneBounds(zone, ratio);
    const backRow = rowsOf(zone, ratio)[0];
    const frontRowOf = rowsOf(zone, ratio).at(-1);
    if (group.colours && (group.colours.length !== group.count || new Set(group.colours.map((c) => c.name)).size < 2)) {
      add('count', `${name}: mixed colours don't match the copies`, item.kind);
    }
    for (const r of rects) {
      if (r.x0 < EDGE - EPS || r.x1 > 1 - EDGE + EPS) add('edges', `${item.singular} too near the side`, item.kind);
      if (r.y1 > (1 - BOTTOM_CLEAR) * ratio + EPS) add('edges', `${item.singular} in the bottom 4%`, item.kind);
      if (r.y0 < TOP_CLEAR * ratio - EPS) add('edges', `${item.singular} touching the top`, item.kind);
      if (item.hangAt !== undefined) {
        const centre = bottom - item.hangAt;
        if (Math.abs((r.y0 + r.y1) / 2 - centre) > 0.011) add('placement', `${item.singular} not hung at its height`, item.kind);
      }
      if (coversKeepClear(r, recipe, ratio)) add('placement', `${item.singular} in front of a door`, item.kind);
      if (zone.flush && Math.abs(r.y1 - bottom) > EPS) add('placement', `${item.singular} not standing on the ${zone.id} line`, item.kind);
      if (item.tall || item.backRow) {
        // Against the wall (or the back of the sand): feet right by the line where the band starts.
        const depth = backRow ? backRow.bottom - backRow.top : 0;
        const [near, far] = AGAINST_BACK;
        if (!backRow || r.y1 < backRow.top + near * depth - EPS || r.y1 > backRow.top + far * depth + EPS) {
          add('placement', `${item.singular} not standing against the back of ${zone.id}`, item.kind);
        }
      }
      if (item.tall || item.backRow) {
        // Rising above its band is allowed for tall anchors.
      } else if (r.y0 < top - EPS || r.y1 > bottom + EPS) {
        add('zone', `${item.singular} crosses out of ${zone.id}`, item.kind);
      }
      if (zone.panels) {
        const col = columnBounds(zone, ['left', 'centre', 'right'].indexOf(regionOf(centreOf(r).x)));
        if (r.x0 < col.x0 - EPS || r.x1 > col.x1 + EPS) add('zone', `${item.singular} crosses a building edge`, item.kind);
      }
      if (!rugOk(item, r, recipe, ratio)) add('rug', `${item.singular} half on the rug`, item.kind);

      const own = group.colours?.[rects.indexOf(r)] ?? group.colour;
      const colour = own?.hex ?? item.tone;
      if (frontRowOf && item.frontRow) {
        const slack = (frontRowOf.bottom - frontRowOf.top - (r.y1 - r.y0)) * AT_FRONT;
        if (r.y1 < frontRowOf.bottom - slack - EPS || r.y1 > frontRowOf.bottom + EPS) add('placement', `${item.singular} not at the front edge of ${zone.id}`, item.kind);
      }
      if (colour) {
        for (const [x, y] of samplePoints(r, ratio)) {
          const surface = recipe.surfaceAt(x, y);
          if (!standsOut(colour, variant.palette[surface])) add('contrast', `${own?.name ?? ''} ${item.singular} blends into the ${surface}`.trim(), item.kind);
        }
      }
    }
    const centre = centreOf(boundsOf(rects)).x;
    if (item.spread && group.count > 1) continue;
    if (regionOf(centre) !== group.region) add('side', `${name} recorded ${group.region} but drawn ${regionOf(centre)}`, item.kind);
    if (Math.abs(centre - THIRDS[0]) < THIRD_MARGIN - EPS || Math.abs(centre - THIRDS[1]) < THIRD_MARGIN - EPS) {
      add('side', `${name} on the line between two sides`, item.kind);
    }
  }

  // Traffic: everything in a one-way band faces the same way.
  for (const zone of recipe.zones.filter((z) => z.oneWay)) {
    const ways = new Set(spec.groups.filter((g) => g.zoneId === zone.id).flatMap((g) => g.boxes.map((b) => !!b.flip)));
    if (ways.size > 1) add('placement', `traffic on the ${zone.id} going both ways`);
  }

  // No two things overlap or touch (copies of one thing follow the duplicate rule above).
  for (let a = 0; a < placed.length; a++) {
    for (let b = a + 1; b < placed.length; b++) {
      const p = placed[a];
      const q = placed[b];
      if (p.group === q.group) continue;
      if (gapBetween(p.rect, q.rect) < GAP - EPS) add('overlap', `${p.item.singular} too close to ${q.item.singular}`, p.item.kind, q.item.kind);
    }
  }

  // Every third of the picture's height has something to remember in it.
  for (let t = 0; t < 3; t++) {
    const has = placed.some((p) => {
      const cy = centreOf(p.rect).y / ratio;
      return cy >= t / 3 && cy < (t + 1) / 3;
    });
    if (!has) add('thirds', `nothing in the ${['top', 'middle', 'bottom'][t]} third`);
  }

  for (const zone of recipe.zones) {
    if ((zone.minGroups ?? 0) > spec.groups.filter((g) => g.zoneId === zone.id).length) add('bare', `${zone.id} left bare`);
  }

  // Backdrop marks stay faint and never inside a thing's box.
  for (const mark of marksFor(spec, recipe, ratio)) {
    if (!mark.scenery && mark.opacity > MAX_MARK_OPACITY + EPS) add('marks', `a backdrop mark is too strong (${mark.opacity})`);
    for (const p of placed) {
      const r = p.rect;
      const scaled = { x0: r.x0 * SCENE_WIDTH, y0: r.y0 * SCENE_WIDTH, x1: r.x1 * SCENE_WIDTH, y1: r.y1 * SCENE_WIDTH };
      if (gapBetween(mark, scaled) < 0) add('marks', `a backdrop mark inside the ${p.item.singular}`, p.item.kind);
    }
  }

  return issues;
}
