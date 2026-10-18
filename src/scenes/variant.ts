import type { Recipe, SceneDetails, VariantDef } from './types';

/**
 * A scene's variant with its own details applied: the palette includes this picture's surface
 * colours (house fronts) and the backdrop draws them. Use this wherever a scene's colours matter.
 */
export function variantOf(recipe: Recipe, spec: { variantId: string; details?: SceneDetails }): VariantDef {
  const base = recipe.variants.find((v) => v.id === spec.variantId) ?? recipe.variants[0];
  const { details } = spec;
  if (!details) return base;
  return { ...base, palette: { ...base.palette, ...details.palette }, background: (height) => base.background(height, details) };
}
