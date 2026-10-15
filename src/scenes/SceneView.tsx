import { memo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { G } from 'react-native-svg';

import { getRecipe } from './recipes';
import { SCENE_WIDTH, type SceneSpec } from './types';

interface SceneViewProps {
  spec: SceneSpec;
}

/**
 * Draws a generated scene, filling its box. The whole scene is always visible;
 * if the box is a different shape, the backdrop simply extends to fill the gap.
 */
export const SceneView = memo(function SceneView({ spec }: SceneViewProps) {
  const sceneH = spec.height;
  const [size, setSize] = useState({ width: SCENE_WIDTH, height: sceneH });
  const recipe = getRecipe(spec.recipeId);
  const variant = recipe.variants.find((v) => v.id === spec.variantId) ?? recipe.variants[0];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ width, height });
  };

  // Widen whichever side of the view box the screen has room for, keeping the scene centred.
  const aspect = size.width / size.height;
  const viewW = Math.max(SCENE_WIDTH, sceneH * aspect);
  const viewH = Math.max(sceneH, SCENE_WIDTH / aspect);
  const viewBox = `${(SCENE_WIDTH - viewW) / 2} ${(sceneH - viewH) / 2} ${viewW} ${viewH}`;

  const placed = spec.groups
    .flatMap((group) => {
      const item = recipe.items.find((i) => i.kind === group.kind)!;
      return group.boxes.map((box, i) => ({ key: `${group.kind}-${i}`, item, box, colour: group.colour?.hex ?? '' }));
    })
    .sort((a, b) => a.box.y + a.item.h * a.box.scale - (b.box.y + b.item.h * b.box.scale));

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        {variant.background(sceneH)}
        {spec.decor.map(({ kind, box }, i) => {
          const decor = recipe.decor?.find((d) => d.kind === kind);
          return decor ? (
            <G key={`decor-${i}`} transform={`translate(${box.x} ${box.y}) scale(${box.scale})`}>
              {decor.draw()}
            </G>
          ) : null;
        })}
        {placed.map(({ key, item, box, colour }) => (
          <G key={key} transform={`translate(${box.x} ${box.y}) scale(${box.scale})`}>
            {item.draw(colour)}
          </G>
        ))}
      </Svg>
    </View>
  );
});
