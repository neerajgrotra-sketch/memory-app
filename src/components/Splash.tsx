import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export const TAGLINE = 'Look closer. Remember more.';

/** Timings in ms. The whole thing is about 1.5 s: long enough to feel made, short enough not to wait for. */
const T = { open: 80, word: 280, tag: 520, blink: 980, leave: 1220, gone: 1500 };
const ease = Easing.out(Easing.cubic);

/** Plays once per launch, not when a screen remounts. */
let played = false;

/**
 * The launch animation, over the app as it loads: an eye opens, "glance" and the tagline rise in,
 * the eye blinks once (it took its glance), and everything fades into the Games tab.
 * The native splash is the same plain background, so the hand-over is seamless. A tap skips it,
 * and with Reduce Motion on it simply appears and fades.
 */
export function Splash() {
  const [visible, setVisible] = useState(!played);
  const reduceMotion = useReducedMotion();
  const open = useSharedValue(reduceMotion ? 1 : 0.04);
  const word = useSharedValue(reduceMotion ? 1 : 0);
  const tag = useSharedValue(reduceMotion ? 1 : 0);
  const fade = useSharedValue(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leave = (after: number) => {
    if (timer.current) clearTimeout(timer.current);
    fade.value = withDelay(after, withTiming(0, { duration: 280 }));
    timer.current = setTimeout(() => setVisible(false), after + 300);
  };

  useEffect(() => {
    if (played) return;
    played = true;
    // Our first frame matches the native splash, so hide it now.
    SplashScreen.hide();
    if (reduceMotion) {
      leave(700);
    } else {
      word.value = withDelay(T.word, withTiming(1, { duration: 380, easing: ease }));
      tag.value = withDelay(T.tag, withTiming(1, { duration: 380, easing: ease }));
      // The eye opens, then blinks: lids close quickly and open a little slower.
      open.value = withDelay(
        T.open,
        withSequence(
          withTiming(1, { duration: 380, easing: ease }),
          withDelay(T.blink - T.open - 380, withTiming(0.08, { duration: 90 })),
          withTiming(1, { duration: 130 }),
        ),
      );
      leave(T.leave);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // Runs once on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: open.value }] }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: word.value, transform: [{ translateY: (1 - word.value) * 14 }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.screen, screenStyle]}>
      <Pressable style={styles.center} onPress={() => leave(0)} accessibilityRole="button" accessibilityLabel={`glance. ${TAGLINE} Tap to skip.`}>
        <Animated.View style={eyeStyle}>
          <Eye />
        </Animated.View>
        <Animated.Text style={[styles.word, wordStyle]}>glance</Animated.Text>
        <Animated.View style={tagStyle}>
          <Text style={styles.tagline}>{TAGLINE}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** The glance eye: an amber outline with an amber iris. */
export function Eye({ width = 112 }: { width?: number }) {
  const height = width * 0.56;
  return (
    <Svg width={width} height={height} viewBox="0 0 112 63">
      <Path d="M4 31.5 C 28 3, 84 3, 108 31.5 C 84 60, 28 60, 4 31.5 Z" fill="none" stroke={colors.accent} strokeWidth={5} strokeLinejoin="round" />
      <Circle cx={56} cy={31.5} r={15} fill={colors.accent} />
      <Circle cx={56} cy={31.5} r={6.5} fill={colors.background} />
      <Circle cx={61} cy={26.5} r={3} fill="#ffffff" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.background, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 40 },
  word: { color: colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: -1.5, marginTop: 10 },
  tagline: { color: colors.textMuted, fontSize: 17, fontWeight: '600', letterSpacing: 0.2 },
});
