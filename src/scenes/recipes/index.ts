import type { Recipe } from '../types';
import { beach } from './beach';
import { city } from './city';
import { farm } from './farm';
import { livingRoom } from './livingRoom';
import { underSea } from './underSea';

/** Every setting the game can build. Add a recipe file and list it here. */
export const RECIPES: Recipe[] = [beach, city, livingRoom, farm, underSea];

export function getRecipe(id: string): Recipe {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) throw new Error(`Unknown recipe "${id}"`);
  return recipe;
}
