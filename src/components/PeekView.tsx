import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Countdown } from '@/components/Countdown';
import { feedback } from '@/feedback';
import { PEEK_SECONDS } from '@/games/lookRemember/peeks';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import { colors, layout } from '@/theme';

interface PeekViewProps {
  scene: SceneSpec;
  onDone: () => void;
}

const FLIP_MS = 320;

/**
 * A Peek: the picture flips in over the question, stays for PEEK_SECONDS with the countdown, then flips
 * away. Laid out like the memorise screen (bar, then the picture), so it's exactly the picture you saw.
 * It holds still (no drifting clouds), and with "reduce motion" on it fades instead of flipping.
 */
export function PeekView({ scene, onDone }: PeekViewProps) {
  const reduceMotion = useReducedMotion();
  // 0 = edge-on (hidden), 1 = facing you.
  const shown = useSharedValue(0);
  const [running, setRunning] = useState(false);
  const done = useRef(false);

  const animate = (to: number, then: () => void) => {
    shown.value = withTiming(to, { duration: FLIP_MS, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }, (finished) => {
      if (finished) scheduleOnRN(then);
    });
  };

  useEffect(() => {
    animate(1, () => setRunning(true));
    // Once, as the peek opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (done.current) return;
    done.current = true;
    animate(0, onDone);
  };

  const style = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: shown.value }
      : { opacity: shown.value < 0.05 ? 0 : 1, transform: [{ perspective: 1200 }, { rotateY: `${(1 - shown.value) * 90}deg` }] },
  );

  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <Animated.View style={[styles.card, style]}>
        <SafeAreaView style={styles.card} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.bar}>
            <Text style={styles.label} accessibilityRole="header">
              Peek
            </Text>
            <Countdown seconds={PEEK_SECONDS} running={running} onComplete={close} onTick={() => feedback('tick')} />
          </View>
          <View style={styles.picture}>
            <SceneView spec={scene} fitToBox />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The question stays dimly visible behind while the picture flips.
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  card: { flex: 1, backgroundColor: colors.background },
  bar: { height: layout.memoriseBarHeight, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  label: { color: colors.accent, fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  picture: { flex: 1 },
});
