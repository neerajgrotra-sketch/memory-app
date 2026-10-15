import type { ReactElement } from 'react';

export type Region = 'left' | 'centre' | 'right';

export interface ColourDef {
  name: string;
  hex: string;
}

/** A horizontal band of the picture where things can be placed, e.g. "in the sky". */
export interface ZoneDef {
  id: string;
  /** Used in questions and answers: "In the sky". */
  label: string;
  top: number;
  bottom: number;
  /** Things stand on the bottom of the band instead of floating in it. */
  ground?: boolean;
  /** Things stand side by side in one row (furniture against a wall), never stacked. */
  singleRow?: boolean;
}

/** Something that can appear in a scene. Drawn in its own w × h box. */
export interface ItemDef {
  kind: string;
  singular: string;
  plural: string;
  article: 'a' | 'an';
  w: number;
  h: number;
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

export interface VariantDef {
  id: string;
  /**
   * Draws the backdrop in the 900 × 1350 scene space. It should spill well past
   * those edges (x −600…1500, y −600…1950) so any screen shape is filled.
   */
  background: () => ReactElement;
}

/** A setting: its backdrop, bands and the things that belong in it. */
export interface Recipe {
  id: string;
  title: string;
  /** Used in "Which of these was on the beach?". */
  place: string;
  zones: ZoneDef[];
  items: ItemDef[];
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

/** Everything needed to redraw a scene and ask about it. */
export interface SceneSpec {
  id: string;
  seed: number;
  recipeId: string;
  variantId: string;
  groups: PlacedGroup[];
}

export const SCENE_WIDTH = 900;
export const SCENE_HEIGHT = 1350;
