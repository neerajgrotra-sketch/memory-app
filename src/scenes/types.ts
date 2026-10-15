import type { ReactElement } from 'react';

export type Region = 'left' | 'centre' | 'right';

export interface ColourDef {
  name: string;
  hex: string;
}

/**
 * How things sit in a band:
 * - `air`: floats anywhere in its slot (sky things).
 * - `wall`: hangs anywhere in its slot (pictures, clocks, windows).
 * - `ground`: stands on the bottom of its slot row (furniture, sand toys, boats on the water).
 */
export type Surface = 'air' | 'wall' | 'ground';

/**
 * A horizontal band of the picture, as fractions of the picture height (0 = top, 1 = bottom).
 * Every band is split into a slot grid of 3 columns (left / middle / right) × `rows` rows.
 */
export interface ZoneDef {
  id: string;
  /** Used in questions and answers: "In the sky". */
  label: string;
  surface: Surface;
  top: number;
  bottom: number;
  /** Slot rows in the band (e.g. back and front of the sand). Bands without things use 0. */
  rows: number;
  /** At least this many kinds of thing go here (e.g. a room wall is never bare). */
  minGroups?: number;
  /**
   * Things here stay inside their own third (one building front per third in the city), instead of
   * being allowed slightly over the line between thirds.
   */
  panels?: boolean;
}

/**
 * Width of everything, as a fraction of the picture width. Things of one kind are always the same size.
 * - `large` anchors (umbrella, sailboat, bookshelf): 0.20–0.28
 * - `medium` (plane, kite, lamp, mirror, clock): 0.13–0.18
 * - `small` countables (ball, starfish, buoy, bird): 0.10–0.13, and never under 44 pt on screen.
 */
export type SizeTier = 'large' | 'medium' | 'small';

export const TIERS: Record<SizeTier, [number, number]> = {
  large: [0.2, 0.28],
  medium: [0.13, 0.18],
  small: [0.1, 0.13],
};

/** Something that can appear in a scene and be asked about. Drawn in its own w × h design box. */
export interface ItemDef {
  kind: string;
  singular: string;
  plural: string;
  article: 'a' | 'an';
  /** Design box the `draw` function uses; its shape sets the height from the width. */
  w: number;
  h: number;
  tier: SizeTier;
  /** Width as a fraction of the picture width; must be inside the tier's range. */
  size: number;
  zones: string[];
  /** The most you'd plausibly see: one sofa, one mirror, several cushions. */
  maxCount: number;
  /** Omit for things with a fixed colour (a crab is always red). */
  colours?: ColourDef[];
  /** Overrides "What colour was the …?" for things where only part is coloured. */
  colourPrompt?: (plural: boolean) => string;
  /** False for one-off things like the sun, where "how many" makes no sense. */
  countable?: boolean;
  /**
   * A tall anchor (palm tree, bookshelf, street lamp): stands in the back row of its band and may
   * rise above the band, on purpose. Nothing else may cross out of its band.
   */
  tall?: boolean;
  /** Never touches the rug (sofas, plants, lamps). Everything else is either fully on the rug or off it. */
  avoidRug?: boolean;
  /** For things with a fixed colour: their main colour, used for the contrast rules and the outline. */
  tone?: string;
  /**
   * Draws the thing in its w × h box. Shapes without their own `stroke` get the outline: 2–3 pt in a
   * darker shade of the thing's own colour. Small details set `stroke="none"`.
   */
  draw: (colour: string) => ReactElement;
}

/** An oval on the floor; things are either fully on it or clear of it. Fractions of width (x) and height (y). */
export interface Rug {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/**
 * A faint backdrop detail (a wave, a floorboard line, a building window). Never asked about,
 * never inside a thing's box, and at most 0.35 opaque so it can't be mistaken for one.
 * Box in design units (picture 900 wide).
 */
export interface Mark {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  opacity: number;
  el: ReactElement;
}

export interface VariantDef {
  id: string;
  /** The colour of each surface the recipe's `surfaceAt` can name, used for contrast rules. */
  palette: Record<string, string>;
  /**
   * Draws the background bands for a picture 900 wide and `height` tall (design units). It should
   * spill well past those edges (x −600…1500, y −600…height+600) so a screen of another shape is filled.
   */
  background: (height: number) => ReactElement;
}

/** A setting: its bands, backdrop and the things that belong in it. */
export interface Recipe {
  id: string;
  title: string;
  /** Used in "Which of these was on the beach?". */
  place: string;
  zones: ZoneDef[];
  items: ItemDef[];
  rug?: Rug;
  /** Which surface (a key of each variant's palette) is behind the point (x, y), as fractions of width and height. */
  surfaceAt: (x: number, y: number) => string;
  /**
   * Faint details drawn over the background for a picture `height` tall (design units), kept out of
   * `boxes` (design units). `random` is seeded, so the same scene always gets the same marks.
   */
  marks?: (height: number, boxes: Rect[], random: () => number, variant: VariantDef) => Mark[];
  variants: VariantDef[];
}

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Where one thing is drawn, in normalized units: `x` and `w` are fractions of the picture width,
 * `y` (the top) is a fraction of the picture height. The height follows from the design box's shape.
 */
export interface Box {
  x: number;
  y: number;
  w: number;
  /** Drawn mirrored, for variety (a plane flying the other way). */
  flip?: boolean;
}

/** The slot-grid cells a group was placed in (for the debug overlay). */
export interface Slot {
  col: number;
  row: number;
  span: number;
}

/** One kind of thing in a scene: all the same colour, in one slot. */
export interface PlacedGroup {
  kind: string;
  count: number;
  colour?: ColourDef;
  zoneId: string;
  /** Which third of the picture the group's centre is in. */
  region: Region;
  slot: Slot;
  boxes: Box[];
}

/** Picture size in points (the measured area below the header). */
export interface SceneSize {
  width: number;
  height: number;
}

/**
 * Everything needed to redraw a scene and ask about it. The groups (kind, count, colour, band, side)
 * are the single source of truth for the questions; laying the scene out again for another screen
 * size moves boxes but never changes them.
 */
export interface SceneSpec {
  id: string;
  seed: number;
  recipeId: string;
  variantId: string;
  /** The size the boxes were laid out for. */
  size: SceneSize;
  groups: PlacedGroup[];
}

/** Design width that drawings and backdrops use; the screen scales it to fit. */
export const SCENE_WIDTH = 900;
/** Layouts are made for pictures between these shapes (height ÷ width); other screens get the backdrop extended. */
export const MIN_RATIO = 1.3;
export const MAX_RATIO = 2.2;

export const ratioOf = (size: SceneSize) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, size.height / Math.max(1, size.width)));
