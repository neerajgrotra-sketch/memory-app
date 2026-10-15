import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
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
  /** The countdown starts when this becomes true (e.g. once the image has loaded). */
  running: boolean;
  onComplete: () => void;
}

/**
 * Counts down from `seconds` to 1 on the UI thread, then calls `onComplete` at 0.
 * Renders inline as a shrinking bar and a number badge, side by side.
 */
export function Countdown({ seconds, running, onComplete }: CountdownProps) {
  const remaining = useSharedValue(seconds);
  const pulse = useSharedValue(1);
  const [display, setDisplay] = useState(seconds);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!running) return;
    const complete = () => onCompleteRef.current();
    remaining.value = seconds;
    remaining.value = withTiming(0, { duration: seconds * 1000, easing: Easing.linear }, (finished) => {
      if (finished) scheduleOnRN(complete);
    });
    return () => cancelAnimation(remaining);
  }, [running, seconds, remaining]);

  useAnimatedReaction(
    () => Math.max(1, Math.ceil(remaining.value)),
    (current, previous) => {
      if (previous === null || current === previous) return;
      scheduleOnRN(setDisplay, current);
      pulse.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 220 }));
    },
  );

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const barStyle = useAnimatedStyle(() => ({ width: `${(remaining.value / seconds) * 100}%` }));

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
      <Animated.View style={[styles.badge, badgeStyle]} accessibilityLabel={`${display} seconds left`}>
        <Text style={styles.number}>{display}</Text>
      </Animated.View>
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
  number: { color: colors.text, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
