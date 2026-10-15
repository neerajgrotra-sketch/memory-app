import { memo, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { G } from 'react-native-svg';

import { shade } from './contrast';
import { relayoutScene } from './generateScene';
import { rectOf } from './layout';
import { LayoutOverlay } from './LayoutOverlay';
import { getRecipe } from './recipes';
import { SCENE_WIDTH, ratioOf, type SceneSize, type SceneSpec } from './types';
import { marksFor, validateScene } from './validateScene';

/** Outline width on screen, in points. */
const OUTLINE_POINTS = 2.5;

interface SceneContentProps {
  spec: SceneSpec;
  /** Screen points per design unit, so outlines come out 2–3 pt whatever the size. */
  pointsPerUnit: number;
  overlay?: boolean;
}

/**
 * The picture's layers, back to front: background bands, faint marks, then things sorted by
 * where they stand (their bottom edge). Also used by the screenshot tools.
 */
export function SceneContent({ spec, pointsPerUnit, overlay }: SceneContentProps) {
  const recipe = getRecipe(spec.recipeId);
  const variant = recipe.variants.find((v) => v.id === spec.variantId) ?? recipe.variants[0];
  const ratio = ratioOf(spec.size);
  const sceneH = SCENE_WIDTH * ratio;

  const placed = spec.groups
    .flatMap((group) => {
      const item = recipe.items.find((i) => i.kind === group.kind)!;
      const colour = group.colour?.hex ?? '';
      const outline = shade(group.colour?.hex ?? item.tone ?? '#555555');
      return group.boxes.map((box, i) => ({ key: `${group.kind}-${i}`, item, box, colour, outline, bottom: rectOf(item, box, ratio).y1 }));
    })
    .sort((a, b) => a.bottom - b.bottom);

  return (
    <>
      {variant.background(sceneH)}
      {marksFor(spec, recipe, ratio).map((m) => m.el)}
      {placed.map(({ key, item, box, colour, outline }) => {
        const scale = (box.w * SCENE_WIDTH) / item.w;
        const x = box.x * SCENE_WIDTH;
        const y = box.y * sceneH;
        return (
          <G
            key={key}
            transform={box.flip ? `translate(${x + item.w * scale} ${y}) scale(${-scale} ${scale})` : `translate(${x} ${y}) scale(${scale})`}
            stroke={outline}
            strokeWidth={OUTLINE_POINTS / (scale * pointsPerUnit)}
            strokeLinejoin="round"
          >
            {item.draw(colour)}
          </G>
        );
      })}
      {overlay && <LayoutOverlay spec={spec} issues={validateScene(spec, spec.size.width, spec.size.height)} pointsPerUnit={pointsPerUnit} />}
    </>
  );
}

interface SceneViewProps {
  spec: SceneSpec;
  /**
   * Lay the scene out again for the measured box if it differs from the size it was made for
   * (the memorise screen). Off for thumbnails, which show the picture exactly as it was memorised.
   */
  fitToBox?: boolean;
  /** Dev-only: draw boxes, slot grid, bands and thirds over the picture. */
  overlay?: boolean;
}

const sameSize = (a: SceneSize, b: SceneSize) => Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;

/**
 * Draws a generated scene, measured with onLayout. When `fitToBox` is set and the measured area isn't
 * the size the scene was laid out for, the same contents are laid out again for it (same kinds,
 * counts, colours, bands and sides). Any other shape gets the backdrop extended around the picture.
 */
export const SceneView = memo(function SceneView({ spec, fitToBox, overlay }: SceneViewProps) {
  const [size, setSize] = useState<SceneSize | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize((s) => (s && sameSize(s, { width, height }) ? s : { width, height }));
  };

  const shown = useMemo(
    () => (fitToBox && size && !sameSize(size, spec.size) ? (relayoutScene(spec, size) ?? spec) : spec),
    [fitToBox, size, spec],
  );

  const box = size ?? spec.size;
  const sceneH = SCENE_WIDTH * ratioOf(shown.size);
  // Widen whichever side of the view box the screen has room for, keeping the scene centred.
  const aspect = box.width / box.height;
  const viewW = Math.max(SCENE_WIDTH, sceneH * aspect);
  const viewH = Math.max(sceneH, SCENE_WIDTH / aspect);
  const viewBox = `${(SCENE_WIDTH - viewW) / 2} ${(sceneH - viewH) / 2} ${viewW} ${viewH}`;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size && (
        <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
          <SceneContent spec={shown} pointsPerUnit={box.width / viewW} overlay={overlay} />
        </Svg>
      )}
    </View>
  );
});
