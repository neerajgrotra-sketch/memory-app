import type { ReactElement } from 'react';

export type Region = 'left' | 'centre' | 'right';

export interface ColourDef {
  name: string;
  hex: string;
}

/**
 * What a band of the picture is, which decides what may go there and how:
 * - `air`: floats (sky). Things keep their size.
 * - `wall`: hangs on a wall or facade. Things keep their size.
 * - `ground`: stands on a floor, sand, pavement, road or water. Things stand
 *   on the floor and get smaller the further back they are.
 */
export type Surface = 'air' | 'wall' | 'ground';

/**
 * A horizontal band of the picture where things can be placed, e.g. "in the sky".
 * Positions are fractions of the picture height, so a band fits any screen shape.
 */
export interface ZoneDef {
  id: string;
  /** Used in questions and answers: "In the sky". */
  label: string;
  surface: Surface;
  /** Everything placed here fits between these heights. */
  top: number;
  bottom: number;
  /** Ground only: the highest point things may stand at (e.g. where the floor meets the wall). Defaults to `top`. */
  floor?: number;
  /** Ground only: size at the back and front of the band (perspective). Defaults to 1. */
  farScale?: number;
  nearScale?: number;
  /** Ground only: one row side by side (furniture against a wall), never several rows deep. */
  singleRow?: boolean;
}

/** Something that can appear in a scene and be asked about. Drawn in its own w × h design box. */
export interface ItemDef {
  kind: string;
  singular: string;
  plural: string;
  article: 'a' | 'an';
  /** Design box the `draw` function uses. */
  w: number;
  h: number;
  /** Real-world height in scene pixels at the front of the picture; keeps sizes in proportion (a sofa > a cat). */
  size: number;
  zones: string[];
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

/** A setting: its backdrop, bands, scenery and the things that belong in it. */
export interface Recipe {
  id: string;
  title: string;
  /** Used in "Which of these was on the beach?". */
  place: string;
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
