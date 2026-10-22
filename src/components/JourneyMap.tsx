import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { BossBadge } from '@/components/BossBadge';
import { SceneSlice, placeThumb } from '@/components/GameArt';
import { feedback } from '@/feedback';
import { JOURNEY, isPlaceStop, type Stop } from '@/games/lookRemember/journey';
import { MAX_LEVEL } from '@/games/lookRemember/ladder';
import { colors } from '@/theme';

/** Space between stops, and around the path. */
const STEP = 104;
const TOP = 120;
const BOTTOM = 110;
const PLACE = 72;
const CHALLENGE = 40;
const FINAL = 60;
const MARKER = 34;
/** How long the marker takes to travel to the next stop. */
const TRAVEL_MS = 1100;

interface JourneyMapProps {
  level: number;
  best: number;
  /** Just reached this level: the marker travels to it from the stop before. */
  arrive?: number;
  /** A stop was tapped; `arrived` once the marker has just reached it. */
  onOpen: (stop: Stop, arrived: boolean) => void;
}

const sizeOf = (s: Stop) => (isPlaceStop(s) ? PLACE : s.kind === 'boss' ? FINAL : CHALLENGE);

/**
 * The 30 levels as one winding path up the screen, Level 1 at the bottom: places as round pictures (a surprise until
 * reached), the levels between as small numbered stops, the final boss at the top. A marker shows where you are; on
 * arriving at a new level it travels there from the stop before, with sparkles as it lands.
 */
export function JourneyMap({ level, best, arrive, onOpen }: JourneyMapProps) {
  const reduceMotion = useReducedMotion();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const width = Math.min(screenWidth, 520);
  const amp = Math.min(width / 2 - 72, 110);
  const at = (l: number) => ({ x: width / 2 + amp * Math.sin((l - 1) * 0.8), y: TOP + (MAX_LEVEL - l) * STEP });
  const height = TOP + (MAX_LEVEL - 1) * STEP + BOTTOM;

  const travelling = arrive === level && level > 1;
  const from = travelling ? level - 1 : level;
  const [here, setHere] = useState(from);
  const [landed, setLanded] = useState(!travelling);

  // The marker, between `from` and `level`, hopping on the way.
  const t = useSharedValue(travelling ? 0 : 1);
  const burst = useSharedValue(0);
  const pulse = useSharedValue(1);
  const a = at(from);
  const b = at(level);
  const markerStyle = useAnimatedStyle(() => {
    const x = a.x + (b.x - a.x) * t.value;
    const y = a.y + (b.y - a.y) * t.value - Math.sin(Math.PI * t.value) * 46;
    return { transform: [{ translateX: x - MARKER / 2 }, { translateY: y - MARKER / 2 - 46 }] };
  });
  const burstStyle = useAnimatedStyle(() => ({ opacity: burst.value === 0 ? 0 : 1 - burst.value, transform: [{ scale: 0.4 + burst.value * 1.6 }] }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const scroll = useRef<ScrollView>(null);
  const scrollTo = (l: number, animated: boolean) => scroll.current?.scrollTo({ y: Math.max(0, at(l).y - screenHeight / 2), animated });

  useEffect(() => {
    // Start in view of where the marker is.
    const first = setTimeout(() => scrollTo(from, false), 0);
    if (!travelling) return () => clearTimeout(first);
    const land = () => {
      setHere(level);
      setLanded(true);
      feedback('journeyArrive');
      if (!reduceMotion) burst.value = withSequence(withTiming(0.001, { duration: 1 }), withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }));
    };
    if (reduceMotion) {
      const done = setTimeout(land, 300);
      return () => {
        clearTimeout(first);
        clearTimeout(done);
      };
    }
    const go = setTimeout(() => {
      feedback('journeyTravel');
      scrollTo(level, true);
      t.value = withTiming(1, { duration: TRAVEL_MS, easing: Easing.inOut(Easing.cubic) });
    }, 700);
    const done = setTimeout(land, 700 + TRAVEL_MS);
    return () => {
      clearTimeout(first);
      clearTimeout(go);
      clearTimeout(done);
    };
    // Runs once, for the arrival this screen was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once there, the stop pulses until it's tapped.
  useEffect(() => {
    if (!landed || reduceMotion) return;
    pulse.set(withDelay(300, withRepeat(withSequence(withTiming(1.12, { duration: 500 }), withTiming(1, { duration: 500 })), -1)));
  }, [landed, pulse, reduceMotion]);

  const path = useMemo(() => {
    const points = Array.from({ length: MAX_LEVEL }, (_, i) => at(i + 1));
    const curve = (upTo: number) =>
      points.slice(0, upTo).reduce((d, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const q = points[i - 1];
        return `${d} C ${q.x} ${q.y - STEP / 2} ${p.x} ${p.y + STEP / 2} ${p.x} ${p.y}`;
      }, '');
    return { all: curve(MAX_LEVEL), done: curve(here) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, here]);

  return (
    <ScrollView ref={scroll} contentContainerStyle={{ height, width, alignSelf: 'center' }} showsVerticalScrollIndicator={false}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={path.all} stroke={colors.border} strokeWidth={8} strokeDasharray="2 14" strokeLinecap="round" fill="none" />
        <Path d={path.done} stroke={colors.accent} strokeWidth={8} strokeLinecap="round" fill="none" />
      </Svg>

      {JOURNEY.map((stop) => {
        const p = at(stop.level);
        const size = sizeOf(stop);
        // The stop being travelled to stays a surprise until the marker lands.
        const reached = stop.level <= Math.max(best, here) && !(travelling && !landed && stop.level === level);
        const current = stop.level === here;
        const labelLeft = p.x > width / 2;
        return (
          <View key={stop.level} style={[styles.stopWrap, { left: p.x - size / 2, top: p.y - size / 2 }]} pointerEvents="box-none">
            <Animated.View style={current && landed ? pulseStyle : undefined}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Level ${stop.level}: ${isPlaceStop(stop) || stop.kind === 'boss' ? stop.title : 'a new challenge'}${reached ? '' : ', still to come'}${current ? ', you are here' : ''}`}
                onPress={() => {
                  feedback('tick');
                  onOpen(stop, travelling && landed && stop.level === level);
                }}
                hitSlop={10}
                style={[
                  styles.stop,
                  { width: size, height: size, borderRadius: size / 2 },
                  reached ? styles.stopReached : styles.stopAhead,
                  current && styles.stopCurrent,
                  stop.kind === 'boss' && styles.stopBoss,
                ]}
              >
                {stop.kind === 'boss' ? (
                  <BossBadge level={stop.level} state={reached ? 'open' : 'locked'} size={size * 0.72} />
                ) : isPlaceStop(stop) ? (
                  reached ? (
                    <SceneSlice art={placeThumb(stop.recipeId)} style={{ width: size - 6, borderRadius: (size - 6) / 2 }} />
                  ) : (
                    <Text style={styles.mystery}>?</Text>
                  )
                ) : (
                  <Text style={[styles.number, reached && styles.numberReached]}>{stop.level}</Text>
                )}
              </Pressable>
            </Animated.View>
            {stop.boss && stop.kind !== 'boss' && (
              <View style={styles.cornerBadge} pointerEvents="none">
                <BossBadge level={stop.boss.level} state={reached ? 'open' : 'locked'} size={24} />
              </View>
            )}
            {(isPlaceStop(stop) || stop.kind === 'boss') && (
              <View style={[styles.label, labelLeft ? { right: size + 10, alignItems: 'flex-end' } : { left: size + 10 }]} pointerEvents="none">
                <Text style={styles.labelLevel}>Level {stop.level}</Text>
                <Text style={[styles.labelTitle, !reached && styles.labelAhead]} numberOfLines={2}>
                  {/* The name is no secret (the level-up headlines say it); the picture is. */}
                  {stop.title}
                </Text>
              </View>
            )}
            {current && landed && (
              <View style={[styles.hint, labelLeft ? { right: size + 10 } : { left: size + 10 }, isPlaceStop(stop) && styles.hintBelow]} pointerEvents="none">
                <Text style={styles.hintText}>Tap to explore</Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Sparkles where the marker lands. */}
      <Animated.View pointerEvents="none" style={[styles.burst, { left: b.x - 60, top: b.y - 60 }, burstStyle]}>
        <Svg width={120} height={120}>
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            return <Circle key={i} cx={60 + Math.cos(angle) * 44} cy={60 + Math.sin(angle) * 44} r={i % 2 ? 4 : 6} fill={i % 2 ? colors.accent : '#ffffff'} />;
          })}
        </Svg>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.marker, markerStyle]} accessibilityElementsHidden>
        <View style={styles.markerEye}>
          <View style={styles.markerPupil} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stopWrap: { position: 'absolute' },
  stop: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 3 },
  stopReached: { backgroundColor: colors.surfaceRaised, borderColor: colors.accent },
  stopAhead: { backgroundColor: colors.surface, borderColor: colors.border },
  stopCurrent: { borderWidth: 4, borderColor: colors.text },
  stopBoss: { backgroundColor: colors.surface, borderColor: colors.boss },
  mystery: { color: colors.textMuted, fontSize: 30, fontWeight: '900' },
  number: { color: colors.textMuted, fontSize: 15, fontWeight: '800' },
  numberReached: { color: colors.text },
  cornerBadge: { position: 'absolute', right: -8, top: -10 },
  label: { position: 'absolute', top: 10, width: 130 },
  labelLevel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  labelTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  labelAhead: { color: colors.textMuted },
  hint: { position: 'absolute', top: 4, backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  hintBelow: { top: PLACE - 4 },
  hintText: { color: colors.accentText, fontSize: 13, fontWeight: '900' },
  burst: { position: 'absolute', width: 120, height: 120 },
  marker: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  markerEye: { width: 18, height: 12, borderRadius: 9, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  markerPupil: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accentText },
});
