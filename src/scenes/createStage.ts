import type { LevelConfig } from '@/game/difficulty';
import type { Question } from '@/types/game';

import { generateQuestions } from './generateQuestions';
import { generateScene } from './generateScene';
import { randomSeed } from './random';
import { RECIPES, getRecipe } from './recipes';
import type { SceneSize, SceneSpec } from './types';

/** A ready-to-play picture: the scene and every question it can answer. */
export interface Stage {
  scene: SceneSpec;
  title: string;
  questions: Question[];
}

/** Fewer than this and a round could run out of different things to ask about. */
const MIN_QUESTIONS = 12;

/**
 * Builds a new stage with the given knobs for a picture `size` points (the area below the header),
 * never in the same setting as `previousRecipeId`.
 */
export function createStage(
  knobs: LevelConfig,
  size: SceneSize,
  previousRecipeId?: string,
  seed = randomSeed(),
  {
    unlocked,
    testing,
  }: {
    /** Settings this level has reached (all when missing). */
    unlocked?: string[];
    /** The profile's testing filter. When set it wins, so a setting can be tuned at any level. */
    testing?: string[] | null;
  } = {},
): Stage {
  const pick = (ids: string[] | null | undefined) => (ids?.length ? RECIPES.filter((r) => ids.includes(r.id)) : []);
  const tested = pick(testing);
  const reached = pick(unlocked);
  const pool = tested.length ? tested : reached.length ? reached : RECIPES;
  const choices = pool.length > 1 ? pool.filter((r) => r.id !== previousRecipeId) : pool;
  const recipe = choices[seed % choices.length];

  // A scene that can't produce enough questions is quietly replaced with another.
  for (let attempt = 0; ; attempt++) {
    const scene = generateScene(recipe, knobs, seed + attempt, size);
    const questions = generateQuestions(scene, recipe, knobs);
    if (questions.length >= MIN_QUESTIONS || attempt >= 10) {
      return { scene, title: getRecipe(scene.recipeId).title, questions };
    }
  }
}
