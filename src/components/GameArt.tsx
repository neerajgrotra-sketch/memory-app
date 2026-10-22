import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { knobsForLevel } from '@/games/lookRemember/ladder';
import { generateScene } from '@/scenes/generateScene';
import { getRecipe } from '@/scenes/recipes';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';

/** A fixed picture made by the game's own engine, picked by eye. */
export interface ArtSpec {
  recipeId: string;
  seed: number;
  /** Where the slice starts, as a fraction of the picture's height. */
  focus: number;
  /** Width / height of the slice. */
  aspect: number;
  /** Things whose ends would poke into the slice from outside it (a kite's string), left out. */
  leftOut?: string[];
}

const SIZE = { width: 393, height: 511 };
const LEVEL = 9;
const cache = new Map<string, SceneSpec>();

function sceneFor(art: ArtSpec): SceneSpec {
  const key = `${art.recipeId}-${art.seed}`;
  let scene = cache.get(key);
  if (!scene) {
    const made = generateScene(getRecipe(art.recipeId), knobsForLevel(LEVEL), art.seed, SIZE);
    scene = { ...made, groups: made.groups.filter((g) => !art.leftOut?.includes(g.kind)) };
    cache.set(key, scene);
  }
  return scene;
}

/** A slice of a full picture, cropped to fill the box. */
export function SceneSlice({ art, style }: { art: ArtSpec; style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const scene = sceneFor(art);
  const fullHeight = width * (scene.size.height / scene.size.width);
  return (
    <View
      style={[styles.box, { aspectRatio: art.aspect }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {width > 0 && (
        <View style={{ position: 'absolute', left: 0, width, height: fullHeight, top: -fullHeight * art.focus }}>
          <SceneView spec={scene} />
        </View>
      )}
    </View>
  );
}

/**
 * Each place's postcard for the journey map (`StopIntro`), picked by eye: a 3:2 slice of a picture with the place's
 * best-known things in it. The map's round thumbnail is a square slice of the same picture, centred on it (`placeThumb`).
 */
const POSTCARD_PICKS: Record<string, [seed: number, focus: number]> = {
  beach: [404, 0.33],
  'living-room': [303, 0.22],
  park: [202, 0.24],
  city: [202, 0.22],
  kitchen: [404, 0.18],
  farm: [101, 0.24],
  'under-sea': [202, 0.1],
  supermarket: [101, 0.03],
  'train-station': [101, 0.08],
  zoo: [202, 0.22],
  'snowy-mountain': [101, 0.14],
  classroom: [202, 0.06],
  'night-campsite': [202, 0.2],
  airport: [303, 0.08],
  space: [404, 0.15],
};
const POSTCARD_ASPECT = 1.5;

export const placePostcard = (recipeId: string): ArtSpec => {
  const [seed, focus] = POSTCARD_PICKS[recipeId] ?? POSTCARD_PICKS.beach;
  return { recipeId: POSTCARD_PICKS[recipeId] ? recipeId : 'beach', seed, focus, aspect: POSTCARD_ASPECT };
};

/** The postcard's picture as a square, centred on the same middle (for the round stops on the map). */
export function placeThumb(recipeId: string): ArtSpec {
  const card = placePostcard(recipeId);
  const ratio = SIZE.height / SIZE.width;
  const cardShare = 1 / POSTCARD_ASPECT / ratio;
  const squareShare = 1 / ratio;
  const focus = Math.max(0, Math.min(1 - squareShare, card.focus + cardShare / 2 - squareShare / 2));
  return { ...card, focus, aspect: 1 };
}

/** The places with a postcard (every recipe should have one: `check:journey`). */
export const POSTCARD_PLACES = Object.keys(POSTCARD_PICKS);

/** Look & Remember's card: a beach with palms, a white sailboat and a strip of sand. */
export const GAME_ART: ArtSpec = { recipeId: 'beach', seed: 1717, focus: 0.26, aspect: 220 / 120, leftOut: ['kite'] };

/** The welcome screen's postcards, one per place. Square slices that stay inside the picture. */
export const POSTCARDS: ArtSpec[] = [
  { recipeId: 'living-room', seed: 939, focus: 0.2, aspect: 1 },
  { recipeId: 'beach', seed: 1717, focus: 0.2, aspect: 1, leftOut: ['kite'] },
  { recipeId: 'city', seed: 1252, focus: 0.12, aspect: 1 },
];

export function GameArt({ style }: { style?: StyleProp<ViewStyle> }) {
  return <SceneSlice art={GAME_ART} style={style} />;
}

/** Look & Remember's square thumbnail, for its row on the Games tab: the same beach, sky to sand. */
export const GAME_THUMB: ArtSpec = { recipeId: 'beach', seed: 1717, focus: 0.12, aspect: 1, leftOut: ['kite', 'sun'] };

export function GameThumb({ style }: { style?: StyleProp<ViewStyle> }) {
  return <SceneSlice art={GAME_THUMB} style={style} />;
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
});
