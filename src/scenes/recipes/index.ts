import type { Recipe } from '../types';
import { airport } from './airport';
import { beach } from './beach';
import { city } from './city';
import { classroom } from './classroom';
import { farm } from './farm';
import { kitchen } from './kitchen';
import { livingRoom } from './livingRoom';
import { nightCampsite } from './nightCampsite';
import { park } from './park';
import { snowyMountain } from './snowyMountain';
import { supermarket } from './supermarket';
import { trainStation } from './trainStation';
import { zoo } from './zoo';
import { underSea } from './underSea';

/** Every setting the game can build. Add a recipe file and list it here. */
export const RECIPES: Recipe[] = [beach, city, livingRoom, park, kitchen, farm, underSea, supermarket, trainStation, zoo, snowyMountain, classroom, nightCampsite, airport];

export function getRecipe(id: string): Recipe {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) throw new Error(`Unknown recipe "${id}"`);
  return recipe;
}
