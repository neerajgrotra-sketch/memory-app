import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors } from '@/theme';

interface CountdownProps {
  seconds: number;
  /** The countdown runs while this is true; set it false to pause (the app in the background), and it carries on from there. */
  running: boolean;
  onComplete: () => void;
  /** Called as the number changes to each new value (e.g. for a tick on the last seconds). */
  onTick?: (secondsLeft: number) => void;
}

/**
 * Counts down from `seconds` to 1 on the UI thread, then calls `onComplete` at 0.
 * Renders inline as a number in a ring followed by a shrinking bar. The ring comes first (on the left)
 * so it is never hidden by anything floating in the top-right corner.
 */
export function Countdown({ seconds, running, onComplete, onTick }: CountdownProps) {
  const remaining = useSharedValue(seconds);
  const pulse = useSharedValue(1);
  const [display, setDisplay] = useState(seconds);

  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);
  // The last number announced: each number ticks once, even if the timer is started again as the picture appears.
  const lastTick = useRef<number | null>(null);
  const tick = (left: number) => {
    if (left === lastTick.current) return;
    lastTick.current = left;
    onTickRef.current?.(left);
  };

  useEffect(() => {
    if (!running) return;
    const complete = () => onCompleteRef.current();
    // After a pause it carries on from where it stopped; the first number is shown without a change, so
    // announce it as the countdown starts (each number only ticks once).
    const from = remaining.value > 0 ? remaining.value : seconds;
    tick(Math.max(1, Math.ceil(from)));
    // A timer, not decoration: it always runs at real speed. (With the phone's "reduce motion" on,
    // animations otherwise finish at once, which skipped the picture entirely.)
    remaining.value = withTiming(0, { duration: from * 1000, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, (finished) => {
      if (finished) scheduleOnRN(complete);
    });
    return () => cancelAnimation(remaining);
  }, [running, seconds, remaining]);

  useAnimatedReaction(
    () => Math.max(1, Math.ceil(remaining.value)),
    (current, previous) => {
      if (previous === null || current === previous) return;
      scheduleOnRN(setDisplay, current);
      scheduleOnRN(tick, current);
      pulse.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 220 }));
    },
  );

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const barStyle = useAnimatedStyle(() => ({ width: `${(remaining.value / seconds) * 100}%` }));

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.badge, badgeStyle]} accessibilityLabel={`${display} seconds left`}>
        <Text style={styles.number}>{display}</Text>
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.surfaceRaised },
  bar: { height: '100%', backgroundColor: colors.accent },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { color: colors.text, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'], textAlign: 'center', includeFontPadding: false },
});
