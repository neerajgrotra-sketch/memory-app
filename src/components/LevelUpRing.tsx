import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ROUNDS_TO_LEVEL_UP } from '@/games/lookRemember/ladder';
import { colors } from '@/theme';

const SPARKS = 12;
const ease = Easing.inOut(Easing.cubic);

/**
 * The level-up ring, animated in about 1.8 s:
 *  1. it shows your old level with the ring nearly full, and the last segment fills in;
 *  2. the full ring spins once while a glow ripples out and sparks fly;
 *  3. the old number drops away and the new level pops in;
 *  4. the segments fade back to empty, ready for the new level.
 * With Reduce Motion on, it simply shows the new level.
 */
export function LevelUpRing({ level, size = 150 }: { level: number; size?: number }) {
  const reduceMotion = useReducedMotion();
  const done = reduceMotion ? 1 : 0;
  const lastSegment = useSharedValue(done);
  const spin = useSharedValue(done);
  const swap = useSharedValue(done);
  const burst = useSharedValue(done);
  const filled = useSharedValue(reduceMotion ? 0 : 1);

  useEffect(() => {
    if (reduceMotion) return;
    lastSegment.value = withDelay(200, withTiming(1, { duration: 320, easing: ease }));
    spin.value = withDelay(520, withTiming(1, { duration: 650, easing: ease }));
    swap.value = withDelay(760, withSpring(1, { damping: 10, stiffness: 160 }));
    burst.value = withDelay(800, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }));
    filled.value = withDelay(1350, withTiming(0, { duration: 450 }));
  }, [burst, filled, lastSegment, reduceMotion, spin, swap]);

  const stroke = Math.max(5, size * 0.09);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = c * 0.035;
  const seg = c / ROUNDS_TO_LEVEL_UP - gap;
  const segment = (i: number, colour: string) => (
    <Circle
      key={i}
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      stroke={colour}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeDasharray={`${seg} ${c - seg}`}
      strokeDashoffset={-(i * (seg + gap)) + c / 4 - gap / 2}
    />
  );

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const filledStyle = useAnimatedStyle(() => ({ opacity: filled.value }));
  const lastStyle = useAnimatedStyle(() => ({ opacity: lastSegment.value }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 0.7 * (1 - burst.value) : 0,
    transform: [{ scale: 1 + burst.value * 0.55 }],
  }));
  const oldStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, swap.value * 1.5),
    transform: [{ translateY: swap.value * size * 0.18 }, { scale: 1 - swap.value * 0.3 }],
  }));
  const newStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, swap.value * 1.5),
    transform: [{ scale: 0.4 + swap.value * 0.6 }],
  }));

  const full = StyleSheet.absoluteFill;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`Level up! You're now on level ${level}.`}>
      <Animated.View style={[styles.halo, { borderRadius: size / 2, borderWidth: stroke }, haloStyle]} />
      {Array.from({ length: SPARKS }, (_, i) => (
        <Spark key={i} index={i} burst={burst} radius={size / 2} />
      ))}
      <Animated.View style={[full, ringStyle]}>
        <Svg width={size} height={size} style={full}>
          {Array.from({ length: ROUNDS_TO_LEVEL_UP }, (_, i) => segment(i, colors.surfaceRaised))}
        </Svg>
        <Animated.View style={[full, filledStyle]}>
          <Svg width={size} height={size} style={full}>
            {Array.from({ length: ROUNDS_TO_LEVEL_UP - 1 }, (_, i) => segment(i, colors.accent))}
          </Svg>
          <Animated.View style={[full, lastStyle]}>
            <Svg width={size} height={size} style={full}>
              {segment(ROUNDS_TO_LEVEL_UP - 1, colors.accent)}
            </Svg>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      <View style={styles.center}>
        <Text style={[styles.caption, { fontSize: size * 0.13 }]}>LEVEL</Text>
        <View style={{ height: size * 0.44, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.Text style={[styles.level, styles.layer, { fontSize: size * 0.36 }, oldStyle]}>{Math.max(1, level - 1)}</Animated.Text>
          <Animated.Text style={[styles.level, styles.layer, { fontSize: size * 0.36 }, newStyle]}>{level}</Animated.Text>
        </View>
      </View>
    </View>
  );
}

/** One spark flying out from the ring as the level changes. */
function Spark({ index, burst, radius }: { index: number; burst: SharedValue<number>; radius: number }) {
  const angle = (index / SPARKS) * 2 * Math.PI;
  const dot = index % 2 ? 6 : 9;
  const style = useAnimatedStyle(() => {
    const d = radius * (0.95 + burst.value * 0.55);
    return {
      opacity: burst.value > 0 && burst.value < 1 ? 1 - burst.value : 0,
      transform: [{ translateX: Math.cos(angle) * d }, { translateY: Math.sin(angle) * d }, { scale: 1 - burst.value * 0.5 }],
    };
  });
  return <Animated.View style={[styles.spark, { width: dot, height: dot, borderRadius: dot / 2, marginLeft: -dot / 2, marginTop: -dot / 2 }, style]} />;
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderColor: colors.accent },
  spark: { position: 'absolute', left: '50%', top: '50%', backgroundColor: colors.accent },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  caption: { color: colors.textMuted, fontWeight: '800', letterSpacing: 1, marginBottom: -2 },
  level: { color: colors.text, fontWeight: '900', fontVariant: ['tabular-nums'] },
  layer: { position: 'absolute' },
});
