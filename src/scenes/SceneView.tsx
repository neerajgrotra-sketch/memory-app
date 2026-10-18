import { memo, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, LinearGradient, Mask, Rect, Stop } from 'react-native-svg';

import { shade } from './contrast';
import { relayoutScene } from './generateScene';
import { rectOf } from './layout';
import { LayoutOverlay } from './LayoutOverlay';
import { getRecipe } from './recipes';
import { variantOf } from './variant';
import { SCENE_WIDTH, ratioOf, type ItemDef, type Recipe, type SceneSize, type SceneSpec } from './types';
import { marksFor, validateScene } from './validateScene';

/** Outline width on screen, in points. */
const OUTLINE_POINTS = 2.5;

/**
 * Which part of the picture to draw. The memorise screen draws the still parts and each moving group
 * in separate layers so the moving ones can drift a few points; everywhere else draws it all at once.
 * Things never overlap (they keep a 4% gap), so splitting them into layers never changes what covers what.
 */
export type SceneLayer = 'all' | 'back' | 'clouds' | 'front' | { kind: string };

interface SceneContentProps {
  spec: SceneSpec;
  /** Screen points per design unit, so outlines come out 2–3 pt whatever the size. */
  pointsPerUnit: number;
  overlay?: boolean;
  layer?: SceneLayer;
}

const zoneOf = (recipe: Recipe, id: string) => recipe.zones.find((z) => z.id === id)!;

/**
 * Things that move while you look: anything in the air or underwater bobs, unless it's fixed in place
 * (`still`: a lamp hanging from the roof, the sun); boats and swans rock on the water.
 */
export const movesIn = (recipe: Recipe, item: ItemDef, zoneId: string) => item.floats === true || (zoneOf(recipe, zoneId).surface === 'air' && !item.still);

/** Kinds that move in this picture. */
export function movingKinds(spec: SceneSpec): string[] {
  const recipe = getRecipe(spec.recipeId);
  return spec.groups.filter((g) => movesIn(recipe, recipe.items.find((i) => i.kind === g.kind)!, g.zoneId)).map((g) => g.kind);
}

/** A number per copy, the same every time the picture is drawn, for small variations (a person's hair). */
function copyNumber(seed: number, group: number, copy: number) {
  let h = (seed ^ Math.imul(group + 1, 2654435761) ^ Math.imul(copy + 1, 40503)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * The picture's layers, back to front: background bands, faint marks, then things sorted by
 * where they stand (their bottom edge). Also used by the screenshot tools.
 */
/** Light falls from the top left: a soft highlight at the top of every thing and gentle shade at the bottom. */
const ITEM_LIGHT: { offset: number; colour: string; opacity: number }[] = [
  { offset: 0, colour: '#ffffff', opacity: 0.3 },
  { offset: 0.42, colour: '#ffffff', opacity: 0 },
  { offset: 0.58, colour: '#000000', opacity: 0 },
  { offset: 1, colour: '#000000', opacity: 0.18 },
];

export function SceneContent({ spec, pointsPerUnit, overlay, layer = 'all' }: SceneContentProps) {
  // Ids for gradients and masks, unique per picture: several pictures can be on screen (and in one web page).
  const uid = `s${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const recipe = getRecipe(spec.recipeId);
  const variant = variantOf(recipe, spec);
  const ratio = ratioOf(spec.size);
  const sceneH = SCENE_WIDTH * ratio;

  const placed = spec.groups
    .flatMap((group, g) => {
      const item = recipe.items.find((i) => i.kind === group.kind)!;
      const moves = movesIn(recipe, item, group.zoneId);
      // Soft shadows under things standing on the ground or a shelf, so nothing looks pasted on.
      const shadow = !moves && zoneOf(recipe, group.zoneId).surface === 'ground';
      return group.boxes.map((box, i) => {
        const own = group.colours?.[i] ?? group.colour;
        const colour = own?.hex ?? '';
        // A colour on the thing's own frame (a signal light, a snowman's scarf) doesn't set the outline: the frame does.
        const outline = shade((item.framedColour ? item.tone : own?.hex) ?? item.tone ?? '#555555');
        const copy = copyNumber(spec.seed, g, i);
        return { key: `${group.kind}-${i}`, kind: group.kind, item, box, colour, outline, moves, shadow, copy, bottom: rectOf(item, box, ratio).y1 };
      });
    })
    .sort((a, b) => a.bottom - b.bottom);
  const drawn = placed.filter((p) =>
    layer === 'all' ? true : layer === 'front' ? !p.moves : typeof layer === 'object' ? p.kind === layer.kind : false,
  );
  const marks = layer === 'all' || layer === 'back' || layer === 'clouds' ? marksFor(spec, recipe, ratio) : [];
  const shownMarks = layer === 'back' ? marks.filter((m) => !m.scenery) : layer === 'clouds' ? marks.filter((m) => m.scenery) : marks;

  const withBack = layer === 'all' || layer === 'back';
  const bands = withBack ? (recipe.light ?? []) : [];
  const transformOf = (box: (typeof drawn)[number]['box'], item: ItemDef) => {
    const scale = (box.w * SCENE_WIDTH) / item.w;
    const x = box.x * SCENE_WIDTH;
    const y = box.y * sceneH;
    return { scale, x, y, t: box.flip && !item.noFlip ? `translate(${x + item.w * scale} ${y}) scale(${-scale} ${scale})` : `translate(${x} ${y}) scale(${scale})` };
  };

  return (
    <>
      <Defs>
        <LinearGradient id={`${uid}light`} x1="0.2" y1="0" x2="0.5" y2="1">
          {ITEM_LIGHT.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.colour} stopOpacity={s.opacity} />
          ))}
        </LinearGradient>
        {bands.map((b, i) => (
          <LinearGradient key={i} id={`${uid}band${i}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={b.from[0]} stopOpacity={b.from[1]} />
            <Stop offset={1} stopColor={b.to[0]} stopOpacity={b.to[1]} />
          </LinearGradient>
        ))}
        {/* Each thing's silhouette, so its light stays inside its own shape. */}
        {drawn.map(({ key, item, box, colour, copy }) => (
          <Mask key={key} id={`${uid}mask-${key}`} maskType="alpha">
            <G transform={transformOf(box, item).t}>{item.draw(colour, spec.details, copy)}</G>
          </Mask>
        ))}
      </Defs>
      {withBack && variant.background(sceneH)}
      {bands.map((b, i) => (
        <Rect key={i} x={-600} y={b.top * sceneH} width={2100} height={(b.bottom - b.top) * sceneH} fill={`url(#${uid}band${i})`} />
      ))}
      {shownMarks.map((m) => m.el)}
      {(layer === 'all' || layer === 'front') &&
        drawn
          .filter((p) => p.shadow)
          .map(({ key, box, bottom }) => {
            const w = box.w * SCENE_WIDTH;
            return <Ellipse key={`shadow-${key}`} cx={(box.x + box.w / 2) * SCENE_WIDTH} cy={bottom * SCENE_WIDTH - 2} rx={w * 0.44} ry={Math.max(5, w * 0.06)} fill="#000000" fillOpacity={0.16} />;
          })}
      {drawn.map(({ key, item, box, colour, outline, copy }) => {
        const { scale, x, y, t } = transformOf(box, item);
        return (
          <G key={key}>
            <G transform={t} stroke={outline} strokeWidth={OUTLINE_POINTS / (scale * pointsPerUnit)} strokeLinejoin="round">
              {item.draw(colour, spec.details, copy)}
            </G>
            <Rect x={x} y={y} width={item.w * scale} height={item.h * scale} fill={`url(#${uid}light)`} mask={`url(#${uid}mask-${key})`} />
          </G>
        );
      })}
      {overlay && (layer === 'all' || layer === 'front') && <LayoutOverlay spec={spec} issues={validateScene(spec, spec.size.width, spec.size.height)} pointsPerUnit={pointsPerUnit} />}
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
  /**
   * Gentle movement while you look (the memorise screen): things in the air or underwater bob up and down,
   * boats and swans rock, clouds drift. A few points at most, so where things are is never in doubt.
   * Off when the phone asks for reduced motion.
   */
  animate?: boolean;
}

/** How far things move, in points, and how long one swing takes. */
const BOB = { amplitude: 3, period: 3200 };
const FLOAT = { amplitude: 1.6, period: 2600 };
const DRIFT = { amplitude: 7, period: 9000 };

/** Moves its picture layer back and forth for ever: up and down, or side to side for clouds. */
function Swing({ amplitude, period, delay, sideways, children }: { amplitude: number; period: number; delay: number; sideways?: boolean; children: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, delay, period]);
  const style = useAnimatedStyle(() => {
    const d = (t.value - 0.5) * 2 * amplitude;
    return { transform: sideways ? [{ translateX: d }] : [{ translateY: d }] };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

const sameSize = (a: SceneSize, b: SceneSize) => Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;

/**
 * Draws a generated scene, measured with onLayout. When `fitToBox` is set and the measured area isn't
 * the size the scene was laid out for, the same contents are laid out again for it (same kinds,
 * counts, colours, bands and sides). Any other shape gets the backdrop extended around the picture.
 */
export const SceneView = memo(function SceneView({ spec, fitToBox, overlay, animate }: SceneViewProps) {
  const [size, setSize] = useState<SceneSize | null>(null);
  const reduceMotion = useReducedMotion();

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

  const pointsPerUnit = box.width / viewW;
  const svg = (layer: SceneLayer) => (
    <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
      <SceneContent spec={shown} pointsPerUnit={pointsPerUnit} overlay={overlay} layer={layer} />
    </Svg>
  );
  const moving = useMemo(() => (animate ? movingKinds(shown) : []), [animate, shown]);
  const recipe = getRecipe(shown.recipeId);

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size &&
        (animate && !reduceMotion ? (
          <>
            {svg('back')}
            <Swing {...DRIFT} delay={0} sideways>
              {svg('clouds')}
            </Swing>
            {svg('front')}
            {moving.map((kind, i) => {
              const group = shown.groups.find((g) => g.kind === kind)!;
              const floats = recipe.items.find((it) => it.kind === kind)?.floats;
              return (
                <Swing key={kind} {...(floats ? FLOAT : BOB)} delay={(i * 530) % 1700}>
                  {svg({ kind: group.kind })}
                </Swing>
              );
            })}
          </>
        ) : (
          svg('all')
        ))}
    </View>
  );
});
