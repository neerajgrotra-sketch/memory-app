import { LEVELS } from '@/game/difficulty';
import type { Level, Question } from '@/types/game';

import { generateQuestions } from './generateQuestions';
import { generateScene } from './generateScene';
import { randomSeed } from './random';
import { RECIPES, getRecipe } from './recipes';
import type { SceneSpec } from './types';

/** A ready-to-play picture: the scene and every question it can answer. */
export interface Stage {
  scene: SceneSpec;
  title: string;
  questions: Question[];
}

/** Fewer than this and a round could run out of different things to ask about. */
const MIN_QUESTIONS = 12;

/** Builds a new stage at the given level, never in the same setting as `previousRecipeId`. */
export function createStage(level: Level, previousRecipeId?: string, seed = randomSeed()): Stage {
  const choices = RECIPES.length > 1 ? RECIPES.filter((r) => r.id !== previousRecipeId) : RECIPES;
  const recipe = choices[seed % choices.length];
  const knobs = LEVELS[level];

  // A scene that can't produce enough questions is quietly replaced with another.
  for (let attempt = 0; ; attempt++) {
    const scene = generateScene(recipe, knobs, seed + attempt);
    const questions = generateQuestions(scene, recipe, knobs);
    if (questions.length >= MIN_QUESTIONS || attempt >= 10) {
      return { scene, title: getRecipe(scene.recipeId).title, questions };
    }
  }
}
