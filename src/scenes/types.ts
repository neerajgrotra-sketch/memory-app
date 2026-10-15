import type { ReactElement } from 'react';

export type Region = 'left' | 'centre' | 'right';

export interface ColourDef {
  name: string;
  hex: string;
}

/**
 * What a band of the picture is, which decides what may go there and how big it is drawn:
 * - `air`: floats in the sky. Sky things are far away, so their `height` is how big they look
 *   (the band's `pxPerCm`, usually 1).
 * - `wall`: hangs on a wall or facade, at the camera scale of the wall's base (`plane`).
 * - `ground`: stands on a floor, sand, pavement, road or water. The band is where feet go;
 *   size follows the camera's perspective at that spot.
 */
export type Surface = 'air' | 'wall' | 'ground';

/** A horizontal band of the picture. Positions are fractions of the picture height. */
export interface ZoneDef {
  id: string;
  /** Used in questions and answers: "In the sky". */
  label: string;
  surface: Surface;
  /** Air and wall: the whole thing fits between these. Ground: where feet may stand. */
  top: number;
  bottom: number;
  /** Air only: scale for sky things (see `Surface`). */
  pxPerCm?: number;
  /** Wall only: where the wall meets the ground; hung things use the camera scale there. */
  plane?: number;
  /** Ground only: one row side by side (furniture against a wall), never several rows deep. */
  singleRow?: boolean;
  /** At least this many kinds of thing go here (e.g. a room wall is never bare). */
  minGroups?: number;
  /**
   * Wall only: the wall is really separate panels (one per building), given as x ranges.
   * Anything hung here stays entirely on one panel, so nothing hangs over a gap or a lower roof.
   */
  panels?: [number, number][];
}

/**
 * How centimetres become picture units, like a real camera: things standing lower in the
 * picture are nearer and bigger. Scale at height y (fraction) is
 * `pxPerCm × (y − horizon) / (ref − horizon)`, measured for a picture 1600 tall.
 */
export interface Camera {
  /** The horizon, as a fraction of the height (may be above the picture, i.e. negative). */
  horizon: number;
  /** A reference line (fraction), e.g. where the floor meets the back wall. */
  ref: number;
  /** Picture units per real centimetre on the reference line. */
  pxPerCm: number;
}

/** Something that can appear in a scene and be asked about. Drawn in its own w × h design box. */
export interface ItemDef {
  kind: string;
  singular: string;
  plural: string;
  article: 'a' | 'an';
  /** Design box the `draw` function uses; its shape sets the width. */
  w: number;
  h: number;
  /** Real-world height in cm as drawn (sky things: how big they look, see `Surface`). */
  height: number;
  zones: string[];
  /** The most you'd plausibly see: one sofa, one mirror, several cushions. */
  maxCount: number;
  /** Omit for things with a fixed colour (a crab is always red). */
  colours?: ColourDef[];
  /** Overrides "What colour was the …?" for things where only part is coloured. */
  colourPrompt?: (plural: boolean) => string;
  /** False for one-off things like the sun, where "how many" makes no sense. */
  countable?: boolean;
  draw: (colour: string) => ReactElement;
}

/** Scenery spread across a band (clouds in the sky). Never asked about, drawn behind everything else. */
export interface DecorDef {
  kind: string;
  w: number;
  h: number;
  /** How tall it looks, in picture units. */
  size: number;
  /** Fractions of the picture height to spread across. */
  top: number;
  bottom: number;
  min: number;
  max: number;
  draw: () => ReactElement;
}

export interface VariantDef {
  id: string;
  /**
   * Draws the backdrop for a picture `height` tall and 900 wide. It should spill
   * well past those edges (x −600…1500, y −600…height+600) so any screen is filled.
   */
  background: (height: number) => ReactElement;
}

/** A setting: its camera, backdrop, bands, scenery and the things that belong in it. */
export interface Recipe {
  id: string;
  title: string;
  /** Used in "Which of these was on the beach?". */
  place: string;
  camera: Camera;
  zones: ZoneDef[];
  items: ItemDef[];
  decor?: DecorDef[];
  variants: VariantDef[];
}

export interface Box {
  x: number;
  y: number;
  scale: number;
}

/** One kind of thing in a scene: all the same colour, all in one spot. */
export interface PlacedGroup {
  kind: string;
  count: number;
  colour?: ColourDef;
  zoneId: string;
  /** Which third of the picture the group's centre is in. */
  region: Region;
  boxes: Box[];
}

export interface PlacedDecor {
  kind: string;
  box: Box;
}

/** Everything needed to redraw a scene and ask about it. */
export interface SceneSpec {
  id: string;
  seed: number;
  recipeId: string;
  variantId: string;
  /** Picture height in scene units (width is always 900); matches the screen it was made for. */
  height: number;
  groups: PlacedGroup[];
  decor: PlacedDecor[];
}

export const SCENE_WIDTH = 900;
export const MIN_SCENE_HEIGHT = 1350;
export const MAX_SCENE_HEIGHT = 2000;
/** Camera scales are measured for a picture this tall and stretch with the actual height… */
export const REFERENCE_HEIGHT = 1600;
/** …up to this height. Taller (narrower) screens get more space, not bigger things, so the width never gets crowded. */
export const MAX_SCALE_HEIGHT = 1700;

/** How much camera scales stretch for a picture `height` tall. */
export const heightFactor = (height: number) => Math.min(height, MAX_SCALE_HEIGHT) / REFERENCE_HEIGHT;
