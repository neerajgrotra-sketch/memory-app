import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius } from '@/theme';

export type OptionStatus = 'idle' | 'correct' | 'wrong' | 'muted';

const SHAKE_OFFSET = 10;
const SHAKE_STEP_MS = 55;

interface AnswerOptionProps {
  label: string;
  status: OptionStatus;
  disabled: boolean;
  onPress: () => void;
  /** Called once the "no" shake has finished (only for `wrong`). */
  onShakeEnd?: () => void;
}

export function AnswerOption({ label, status, disabled, onPress, onShakeEnd }: AnswerOptionProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (status !== 'wrong') return;
    const step = { duration: SHAKE_STEP_MS };
    offset.value = withSequence(
      withTiming(-SHAKE_OFFSET, step),
      withTiming(SHAKE_OFFSET, step),
      withTiming(-SHAKE_OFFSET, step),
      withTiming(SHAKE_OFFSET, step),
      withTiming(-SHAKE_OFFSET / 2, step),
      withTiming(0, step, (finished) => {
        if (finished && onShakeEnd) scheduleOnRN(onShakeEnd);
      }),
    );
    // Only re-run when this option becomes the wrong pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <Animated.View style={shakeStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: status === 'correct' || status === 'wrong' }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.option,
          pressed && styles.pressed,
          status === 'correct' && styles.correct,
          status === 'wrong' && styles.wrong,
          status === 'muted' && styles.muted,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        {status === 'correct' && <Text style={[styles.mark, { color: colors.correct }]}>✓</Text>}
        {status === 'wrong' && <Text style={[styles.mark, { color: colors.wrong }]}>✗</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  correct: { borderColor: colors.correct, backgroundColor: 'rgba(46,194,126,0.15)' },
  wrong: { borderColor: colors.wrong, backgroundColor: 'rgba(229,72,77,0.15)' },
  muted: { opacity: 0.45 },
  label: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '600' },
  mark: { fontSize: 20, fontWeight: '800' },
});
