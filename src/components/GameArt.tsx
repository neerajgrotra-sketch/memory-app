import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { knobsForLevel } from '@/games/lookRemember/ladder';
import { generateScene } from '@/scenes/generateScene';
import { getRecipe } from '@/scenes/recipes';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';

/**
 * The picture on Look & Remember's card: always the same beach (palms, a sailboat, a strip of sand), made by
 * the game's own engine. Picked by eye; `focus` is where the slice starts, as a fraction of the picture's height.
 */
const ART = { recipeId: 'beach', seed: 1717, level: 9, size: { width: 393, height: 511 }, focus: 0.26 };
/** Every slice has the same shape (the game card's), so the art looks the same wherever it's shown. */
const ASPECT = 220 / 120;

let cached: SceneSpec | null = null;
/** Things above the slice whose ends would poke into it (a kite's string), left out of the art. */
const LEFT_OUT = ['kite'];
const artScene = () => {
  if (cached) return cached;
  const scene = generateScene(getRecipe(ART.recipeId), knobsForLevel(ART.level), ART.seed, ART.size);
  return (cached = { ...scene, groups: scene.groups.filter((g) => !LEFT_OUT.includes(g.kind)) });
};

/** A slice of a full picture, cropped to fill the box (the top of the slice at `focus` of the picture's height). */
export function GameArt({ style }: { style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const scene = artScene();
  const fullHeight = width * (scene.size.height / scene.size.width);
  return (
    <View style={[styles.box, { aspectRatio: ASPECT }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {width > 0 && (
        <View style={{ position: 'absolute', left: 0, width, height: fullHeight, top: -fullHeight * ART.focus }}>
          <SceneView spec={scene} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
});
