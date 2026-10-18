import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { POSTCARDS, SceneSlice } from '@/components/GameArt';
import { feedback } from '@/feedback';
import { colors, radius } from '@/theme';

export const TAGLINE = 'Look closer. Remember more.';
/** The welcome screen's words. */
export const HOOK = 'How much can you\nremember at a glance?';
export const HOOK_DETAIL = 'Quick picture games for your memory.\nA few minutes a day.';

/**
 * Timings in ms. The tagline is fully shown at about 0.9 s, then held so it can be read: longer on the
 * first launch, shorter once you've seen it (a tap always skips).
 */
const T = { open: 80, word: 280, tag: 520, blink: 1500, leaveFirst: 2600, leaveAgain: 1700 };
const ease = Easing.out(Easing.cubic);

/** Set once "Let's go" has been tapped, so the welcome only shows on the first launch. */
const WELCOMED_KEY = 'glance.welcomed.v1';

/** Plays once per launch, not when a screen remounts. */
let played = false;

/**
 * The launch: an eye opens, "glance" and the tagline rise in, the eye blinks once (it took its glance).
 * On the very first launch it then turns into a welcome (postcards of the places, the hook, Let's go);
 * after that it fades straight into the Games tab. The native splash is the same plain background, so
 * the hand-over is seamless. A tap skips the animation; with Reduce Motion on nothing moves.
 */
export function Splash() {
  const [phase, setPhase] = useState<'intro' | 'welcome' | 'gone'>(played ? 'gone' : 'intro');
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const open = useSharedValue(reduceMotion ? 1 : 0.04);
  const word = useSharedValue(reduceMotion ? 1 : 0);
  const tag = useSharedValue(reduceMotion ? 1 : 0);
  const intro = useSharedValue(1);
  const fade = useSharedValue(1);
  const cardLeft = useSharedValue(0);
  const cardMiddle = useSharedValue(0);
  const cardRight = useSharedValue(0);
  const words = useSharedValue(0);
  const welcomed = useRef<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decided = useRef(false);

  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    fade.value = withTiming(0, { duration: 300 });
    timer.current = setTimeout(() => setPhase('gone'), 320);
  };

  const showWelcome = () => {
    setPhase('welcome');
    intro.value = withTiming(0, { duration: 250 });
    const pop = (delay: number) => (reduceMotion ? 1 : withDelay(delay, withSpring(1, { damping: 13, stiffness: 120 })));
    cardMiddle.value = pop(150);
    cardLeft.value = pop(280);
    cardRight.value = pop(380);
    words.value = reduceMotion ? 1 : withDelay(450, withTiming(1, { duration: 450, easing: ease }));
  };

  /** After the eye: the welcome on a first launch, otherwise straight in. */
  const next = () => {
    if (decided.current) return;
    decided.current = true;
    if (welcomed.current === false) showWelcome();
    else leave();
  };

  useEffect(() => {
    if (played) return;
    played = true;
    AsyncStorage.getItem(WELCOMED_KEY)
      .then((v) => (welcomed.current = v === '1'))
      .catch(() => (welcomed.current = true));
    // Our first frame matches the native splash, so hide it now.
    SplashScreen.hide();
    if (!reduceMotion) {
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
    }
    // Whether this is the first launch is known well before the hold ends; check it then.
    timer.current = setTimeout(
      () => {
        if (welcomed.current === false) timer.current = setTimeout(next, T.leaveFirst - T.leaveAgain);
        else next();
      },
      reduceMotion ? 1200 : T.leaveAgain,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // Runs once on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const letsGo = () => {
    feedback('start');
    AsyncStorage.setItem(WELCOMED_KEY, '1').catch(() => {});
    leave();
  };

  const screenStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const introStyle = useAnimatedStyle(() => ({ opacity: intro.value }));
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: open.value }] }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: word.value, transform: [{ translateY: (1 - word.value) * 14 }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: (1 - tag.value) * 10 }] }));
  const wordsStyle = useAnimatedStyle(() => ({ opacity: words.value, transform: [{ translateY: (1 - words.value) * 16 }] }));

  if (phase === 'gone') return null;
  return (
    <Animated.View style={[styles.screen, screenStyle]}>
      {phase === 'intro' && (
        <Animated.View style={[styles.fill, introStyle]}>
          <Pressable style={styles.center} onPress={next} accessibilityRole="button" accessibilityLabel={`glance. ${TAGLINE} Tap to skip.`}>
            <Animated.View style={eyeStyle}>
              <Eye />
            </Animated.View>
            <Animated.Text style={[styles.word, wordStyle]}>glance</Animated.Text>
            <Animated.View style={tagStyle}>
              <Text style={styles.tagline}>{TAGLINE}</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}

      {phase === 'welcome' && (
        <View style={[styles.welcome, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          {/* Postcards of the places you'll play in, fanned out. */}
          <View style={styles.cards} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Postcard index={0} enter={cardLeft} />
            <Postcard index={2} enter={cardRight} />
            <Postcard index={1} enter={cardMiddle} />
          </View>

          <Animated.View style={[styles.words, wordsStyle]}>
            <View style={styles.brand}>
              <Eye width={40} />
              <Text style={styles.brandWord}>glance</Text>
            </View>
            <Text style={styles.hook} accessibilityRole="header">
              {HOOK}
            </Text>
            <Text style={styles.detail}>{HOOK_DETAIL}</Text>
            <View style={styles.action}>
              <Button label="Let’s go" onPress={letsGo} />
            </View>
            <Text style={styles.footer}>Free to play · No account needed</Text>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

/** Where each postcard sits in the fan: left, middle (on top, a little bigger), right. */
const FAN = [
  { x: -98, y: 18, rotate: -9, scale: 0.9 },
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 98, y: 18, rotate: 9, scale: 0.9 },
];

function Postcard({ index, enter }: { index: number; enter: SharedValue<number> }) {
  const at = FAN[index];
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.4),
    transform: [
      { translateX: at.x * enter.value },
      { translateY: at.y + (1 - enter.value) * 40 },
      { rotate: `${at.rotate * enter.value}deg` },
      { scale: at.scale * (0.85 + 0.15 * enter.value) },
    ],
  }));
  return (
    <Animated.View style={[styles.card, style]}>
      <SceneSlice art={POSTCARDS[index]} style={styles.cardArt} />
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

/** A classic serif for the hook, like a book title: the one place glance uses one. */
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });

const CARD_WIDTH = 150;

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.background, zIndex: 100 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 40 },
  word: { color: colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: -1.5, marginTop: 10 },
  tagline: { color: colors.textMuted, fontSize: 17, fontWeight: '600', letterSpacing: 0.2 },
  welcome: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 24, justifyContent: 'center', gap: 28 },
  cards: { height: CARD_WIDTH + 60, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    borderRadius: radius.md,
    padding: 6,
    // A photo-print edge, deeper at the bottom.
    paddingBottom: 20,
    backgroundColor: '#f5f1e8',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardArt: { width: '100%', borderRadius: radius.sm },
  words: { alignItems: 'center', gap: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandWord: { color: colors.accent, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  hook: { color: colors.text, fontFamily: SERIF, fontSize: 29, lineHeight: 36, fontWeight: '700', textAlign: 'center' },
  detail: { color: colors.textMuted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: 10 },
  footer: { color: colors.textMuted, fontSize: 13 },
});
