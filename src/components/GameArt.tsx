import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { knobsForLevel } from '@/games/lookRemember/ladder';
import { generateScene } from '@/scenes/generateScene';
import { getRecipe } from '@/scenes/recipes';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';

/** The picture on Look & Remember's card: always the same one, made by the game's own engine. */
const ART = { recipeId: 'city', seed: 977, level: 10, size: { width: 393, height: 560 }, focus: 0.2 };

let cached: SceneSpec | null = null;
const artScene = () => (cached ??= generateScene(getRecipe(ART.recipeId), knobsForLevel(ART.level), ART.seed, ART.size));

/** A slice of a full picture, cropped to fill the box (the top of the slice at `focus` of the picture's height). */
export function GameArt({ style }: { style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  const scene = artScene();
  const fullHeight = width * (scene.size.height / scene.size.width);
  return (
    <View style={[styles.box, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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
