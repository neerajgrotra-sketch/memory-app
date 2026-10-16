import { RECIPES } from '@/scenes/recipes';
import type { Profile } from '@/types/profile';

import { RECIPE_UNLOCKS, recipesForLevel } from './ladder';

/**
 * My Places: the player picks which places (recipes) Look & Remember plays, to train on the ones they
 * like or find hardest.
 *
 * Saved as the places switched **off**, so a place unlocked later joins automatically (the level-up
 * screen promises it). Only places your level has reached can be switched; Practice can play every
 * place, as before, minus the ones switched off. At least one place always stays on.
 */
export function placesOff(profile: Pick<Profile, 'placesOff' | 'recipeFilter'> | null | undefined): string[] {
  if (!profile) return [];
  if (profile.placesOff) return profile.placesOff;
  // Profiles from the old testing switch saved the places switched on instead.
  if (profile.recipeFilter?.length) return RECIPES.map((r) => r.id).filter((id) => !profile.recipeFilter!.includes(id));
  return [];
}

/** The places to pick pictures from: those allowed (by level, or all in Practice) that aren't off, or all allowed if none are left. */
export function placesToPlay(allowed: string[], off: string[]): string[] {
  const on = allowed.filter((id) => !off.includes(id));
  return on.length ? on : allowed;
}

/** Every place in unlock order, with whether your level has reached it and whether it's on. */
export function myPlaces(level: number, off: string[]) {
  const unlocked = recipesForLevel(level);
  return RECIPE_UNLOCKS.map((u) => {
    const recipe = RECIPES.find((r) => r.id === u.recipeId)!;
    const reached = unlocked.includes(u.recipeId);
    return { id: u.recipeId, title: recipe.title, level: u.level, reached, on: reached && !off.includes(u.recipeId) };
  });
}

/** `off` with `id` switched, or null if that would leave no reached place on. */
export function togglePlace(level: number, off: string[], id: string): string[] | null {
  const next = off.includes(id) ? off.filter((x) => x !== id) : [...off, id];
  return myPlaces(level, next).some((p) => p.on) ? next : null;
}
