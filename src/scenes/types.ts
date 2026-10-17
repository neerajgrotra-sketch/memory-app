import type { ReactElement } from 'react';

import type { ClockStep } from './clock';
import type { Rng } from './random';

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
  /** Relative heights of the rows, back first (default: equal). */
  rowSizes?: number[];
  /** At least this many kinds of thing go here (e.g. a room wall is never bare). */
  minGroups?: number;
  /** At most this many kinds go here (one lane of road holds a vehicle and a scooter). */
  maxGroups?: number;
  /** Everything here faces the same way (traffic on a road), chosen once per picture. */
  oneWay?: boolean;
  /** At least this many of the band's kinds are anchors (tall, against the wall or extra wide): a room always has furniture. */
  anchors?: number;
  /** Ground bands: things stand exactly on the bottom line (flags and dishes on a roofline). */
  flush?: boolean;
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
export type SizeTier = 'xl' | 'large' | 'medium' | 'small';

/**
 * `xl` is for things that must be bigger than everything else to look right next to people and
 * doors (cars, vans, buses, a sofa). They may span more than one column.
 */
export const TIERS: Record<SizeTier, [number, number]> = {
  xl: [0.3, 0.62],
  large: [0.2, 0.28],
  medium: [0.13, 0.18],
  small: [0.1, 0.13],
};

/** Something that can appear in a scene and be asked about. Drawn in its own w × h design box. */
export interface ItemDef {
  kind: string;
  singular: string;
  plural: string;
  /** 'the' for things there's only one of in the world (the sun): "The sun", never "A sun". */
  article: 'a' | 'an' | 'the';
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
  /** Only in the last slot row of its band, at its bottom edge: fire hydrants at the kerb. */
  frontRow?: boolean;
  /** On levels that allow it, each copy may be a different colour (fire hydrants). */
  mixedColours?: boolean;
  /** Only in the first slot row of its band, close to its top edge: furniture against the back wall. */
  backRow?: boolean;
  /**
   * Wall things: hung with their centre this far above the bottom of the band (fractions of the
   * picture width), so pictures, mirrors and windows share one eye-level line and a clock hangs above it.
   */
  hangAt?: number;
  /**
   * Picked first for its band when the band gets at least two kinds, so most pictures have it (pupils in a
   * classroom). Still varies in count, colour and place.
   */
  usual?: boolean;
  /** `xl` things: may be wider than one column (a bus); the side is still the third its centre is in. */
  wide?: boolean;
  /**
   * Copies go one per column, standing on the same line (street lamps along a pavement, a flag on
   * each roof, palm trees along the beach), never bunched in one spot.
   */
  spread?: boolean;
  /**
   * Copies stand side by side in one neat row, a little apart (products on a shelf), instead of the
   * staggered groups other things make. For bands where things stand on a line (`flush`).
   */
  lineUp?: boolean;
  /** Floats on water in a ground band (a rowing boat, a swan): rocks gently while you look, and casts no shadow. */
  floats?: boolean;
  /** Never drawn mirrored: a clock face read backwards shows the wrong time. */
  noFlip?: boolean;
  /**
   * The asked-about colour sits on the thing's own dark frame (a signal light in its black housing), so
   * it never touches the backdrop: the contrast rules check `tone` (the frame) instead of the colour.
   */
  framedColour?: boolean;
  /** For things with a fixed colour: their main colour, used for the contrast rules and the outline. */
  tone?: string;
  /**
   * Draws the thing in its w × h box. Shapes without their own `stroke` get the outline: 2–3 pt in a
   * darker shade of the thing's own colour. Small details set `stroke="none"`. Things that show a
   * per-picture detail (the time on a clock) read it from `details`. `copy` is a number fixed per copy,
   * for small variations that are never asked about (a person's hair and skin).
   */
  draw: (colour: string, details?: SceneDetails, copy?: number) => ReactElement;
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
  /** Scenery like clouds: drawn solid (no opacity limit) but still never touching a thing. */
  scenery?: boolean;
  el: ReactElement;
}

/** A house in the street: its front colour and the number above its door. */
export interface House {
  colour: ColourDef;
  number: number;
}

/**
 * Something about the backdrop a question can ask (the barn's colour). Any recipe can add these in
 * `details`; they're asked on levels with detail questions, like the city's house numbers.
 */
export interface DetailFact {
  /** Unique in the scene; also the question's subject, so a round asks one question per fact. */
  id: string;
  type: 'colour' | 'number' | 'object' | 'position' | 'count';
  prompt: string;
  answer: string;
  /** Believable wrong answers (at least 3), e.g. the other colours a barn can be. Best first. */
  wrong: string[];
  /** More wrong answers, used only when `wrong` has fewer than 3 left. */
  fallback?: string[];
  /** Only asked when this kind of thing is in the picture (the time, when there's a clock). */
  needs?: string;
  /** Asked first in a round whenever it can be (see `Question.spotlight`). */
  spotlight?: boolean;
  /** Asked on every level, not just from Level 8 (the clock, whose times get harder instead). */
  everyLevel?: boolean;
}

/**
 * Per-picture details of the backdrop, chosen when the scene is made (city house colours and numbers,
 * the farm's barn colour). They are facts the questions can ask about, and they override the variant's palette.
 */
export interface SceneDetails {
  /** Left to right, one per third. */
  houses?: House[];
  /** Surface colours for this picture, over the variant's palette (e.g. `facade0`). */
  palette?: Record<string, string>;
  /** Questions about the backdrop (see `DetailFact`). */
  facts?: DetailFact[];
  /** Other per-picture choices the backdrop draws from (e.g. which side the barn is on). */
  values?: Record<string, string>;
}

export interface VariantDef {
  id: string;
  /** The colour of each surface the recipe's `surfaceAt` can name, used for contrast rules. */
  palette: Record<string, string>;
  /**
   * Draws the background bands for a picture 900 wide and `height` tall (design units). It should
   * spill well past those edges (x −600…1500, y −600…height+600) so a screen of another shape is filled.
   */
  background: (height: number, details?: SceneDetails) => ReactElement;
}

/**
 * Light across a band of the picture, drawn over the background (under the things): haze near the
 * horizon, water getting deeper, shade under a shelf. A vertical gradient from `from` at the band's top
 * to `to` at its bottom, each a colour and an opacity. Kept subtle (opacity 0.2 at most) so the
 * colours the contrast rules check still hold.
 */
export interface LightBand {
  top: number;
  bottom: number;
  from: [string, number];
  to: [string, number];
}

/** What a recipe's `details` may vary by level. */
export interface DetailKnobs {
  /** How exact clock times are: whole hours, half past, or quarters. */
  clockStep: ClockStep;
}

/** A setting: its bands, backdrop and the things that belong in it. */
export interface Recipe {
  id: string;
  title: string;
  zones: ZoneDef[];
  items: ItemDef[];
  rug?: Rug;
  /** Areas nothing may cover (building doors), as fractions: x of the width, y of the height. */
  keepClear?: Rect[];
  /** Light across bands of the backdrop (see `LightBand`), back to front. */
  light?: LightBand[];
  /** Chooses this picture's backdrop details (house colours and numbers, the time on the clock). */
  details?: (random: Rng, knobs: DetailKnobs) => SceneDetails;
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
  /** The group's colour, when every copy is the same colour. */
  colour?: ColourDef;
  /** One colour per copy (same order as `boxes`), when copies differ (fire hydrants on Hard). */
  colours?: ColourDef[];
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
  /** Backdrop details for this picture (house colours and numbers), if the recipe has any. */
  details?: SceneDetails;
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
