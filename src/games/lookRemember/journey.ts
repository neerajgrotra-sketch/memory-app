import { BOSSES, MAX_LEVEL, RECIPE_UNLOCKS, unlocksAt } from '@/games/lookRemember/ladder';

/**
 * The journey: the 30 levels as stops on one trip, shown on the journey map. Every even level from 2 to 28 is a new
 * place; the levels between are a new challenge in the place you're in; Levels 10, 20 and 30 also have a boss.
 */

export type StopKind = 'start' | 'place' | 'challenge' | 'boss';

export interface Stop {
  level: number;
  kind: StopKind;
  /** The place the stop is in: the new one, or the last one reached. */
  recipeId: string;
  /** "the farm", "under the sea". */
  placeName: string;
  /** "The farm" for a place, "Level 7" for a challenge, "The Final Boss" for the last. */
  title: string;
  /** One line of the trip's story. */
  story: string;
  /** What the level brings (the level-up headlines, without the points line). */
  news: string[];
  boss?: (typeof BOSSES)[number];
}

/** One line of story for each place, as the trip reaches it. */
const PLACE_STORIES: Record<string, string> = {
  beach: 'Your trip starts at the seaside. Look closely: the beach is busier than it seems.',
  'living-room': 'Home to unpack. Every room has its own little stories.',
  park: 'A walk in the park, where dogs, kites and fountains keep everyone busy.',
  city: 'Into town: count the houses, read the door numbers and mind the traffic.',
  kitchen: 'Time for lunch. Pots, pans and a kettle that never stops.',
  farm: 'Out to the countryside, where the animals are up early.',
  'under-sea': 'Dive in! Fish, turtles and a submarine somewhere below.',
  supermarket: 'A trip to the shops, with a deal on every shelf.',
  'train-station': 'All aboard: the station board says where next.',
  zoo: 'Feeding time at the zoo. Who is in which enclosure?',
  'snowy-mountain': 'Up the mountain: skiers, sleds and something hiding in the snow.',
  classroom: 'Back to school, where the board has a sum waiting for you.',
  'night-campsite': 'Night falls at the campsite. Tents, a campfire and an owl watching.',
  airport: 'Off to the airport: gates, planes and suitcases everywhere.',
  space: 'Lift off! The Moon, the last new place on the trip.',
};

/** For the stops between places, in turn. */
const CHALLENGE_LINES = ['Same place, a new twist.', 'Look a little closer this time.', 'The next stop asks a little more of your eyes.'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function stopAt(level: number): Stop {
  const l = Math.max(1, Math.min(MAX_LEVEL, level));
  const place = [...RECIPE_UNLOCKS].reverse().find((r) => r.level <= l)!;
  const news = unlocksAt(l).filter((n) => !n.startsWith('Each right answer'));
  const boss = BOSSES.find((b) => b.level === l);
  const base = { level: l, recipeId: place.recipeId, placeName: place.name, news, boss };
  if (l === 1) return { ...base, kind: 'start', title: cap(place.name), story: PLACE_STORIES[place.recipeId] };
  if (place.level === l) return { ...base, kind: 'place', title: cap(place.name), story: PLACE_STORIES[place.recipeId] };
  // The boss's own place (the airport), not the last place reached (the Moon): its card showed the wrong picture.
  if (boss)
    return { ...base, kind: 'boss', recipeId: boss.recipeId, title: `The ${boss.badge}`, story: `The last stop on the trip: ${boss.name} is the busiest place yet.` };
  return { ...base, kind: 'challenge', title: `Level ${l}`, story: `Still at ${place.name}. ${CHALLENGE_LINES[l % CHALLENGE_LINES.length]}` };
}

export const JOURNEY: Stop[] = Array.from({ length: MAX_LEVEL }, (_, i) => stopAt(i + 1));

/** Whether a stop shows a place's picture (a new place, or the start). */
export const isPlaceStop = (s: Stop) => s.kind === 'place' || s.kind === 'start';
