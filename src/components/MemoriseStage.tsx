import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Countdown } from '@/components/Countdown';
import { QuitButton } from '@/components/QuitButton';
import { SoundToggle } from '@/components/SoundToggle';
import { feedback } from '@/feedback';
import { toggleLayoutOverlay, useLayoutOverlay } from '@/scenes/debugOverlay';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import { colors, layout } from '@/theme';

interface MemoriseStageProps {
  scene: SceneSpec;
  seconds: number;
  /** Called when the time is up or the player taps "I'm ready", with how many seconds they looked. */
  onDone: (lookedSeconds: number) => void;
  onQuit: () => void;
  /** A coach's tip over the bottom of the picture for its first few seconds (the guided first round), then gone, so
   * it never hides what's to be remembered for long. */
  hint?: string;
  /** Holds the countdown (a "leave?" question showing over the picture). */
  paused?: boolean;
}

/** How long the coach's tip stays over the picture. */
const HINT_MS = 3500;

/** "I'm ready" ignores taps this soon after the picture appears, so a stray tap can't skip it unseen. */
const READY_DELAY_MS = 1000;

/**
 * The controls sit in a bar above the picture, never on top of it. The timer is on the left next to
 * the quit button, so nothing floating in the top-right corner (like Expo Go's tools button) can hide it.
 * The picture fills the rest, down to the bottom safe-area inset.
 */
export function MemoriseStage({ scene, seconds, onDone, onQuit, hint, paused = false }: MemoriseStageProps) {
  const overlay = useLayoutOverlay();
  const [showHint, setShowHint] = useState(!!hint);
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setShowHint(false), HINT_MS);
    return () => clearTimeout(t);
  }, [hint]);
  const shownAt = useRef(0);
  const [armed, setArmed] = useState(false);
  const done = useRef(false);
  // The countdown waits while the app is in the background (a phone call), so no looking time is lost.
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const pausedAt = useRef<number | null>(null);

  useEffect(() => {
    shownAt.current = Date.now();
    const t = setTimeout(() => setArmed(true), READY_DELAY_MS);
    const sub = AppState.addEventListener('change', (state) => {
      const now = state === 'active';
      if (!now && pausedAt.current === null) pausedAt.current = Date.now();
      // Time away doesn't count as looking.
      if (now && pausedAt.current !== null) {
        shownAt.current += Date.now() - pausedAt.current;
        pausedAt.current = null;
      }
      setActive(now);
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, []);

  /** The same tick as each number of the countdown appears. */
  const onTick = () => {
    if (!done.current) feedback('tick');
  };

  const finish = (lookedSeconds: number) => {
    if (done.current) return;
    done.current = true;
    onDone(Math.min(seconds, Math.round(lookedSeconds * 10) / 10));
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.bar}>
        <QuitButton onPress={onQuit} />
        {__DEV__ && (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: overlay }}
            accessibilityLabel="Show layout boxes"
            onPress={toggleLayoutOverlay}
            style={[styles.devButton, overlay && styles.devButtonOn]}
          >
            <Text style={styles.devText}>▦</Text>
          </Pressable>
        )}
        {/* While the layout overlay is on, or the app is in the background, the timer waits. */}
        <Countdown seconds={seconds} running={!overlay && active && !paused} onComplete={() => finish(seconds)} onTick={onTick} />
        <SoundToggle />
        {/* Ready before the time is up: a deliberate button, never a tap on the picture itself. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I'm ready, go to the questions"
          accessibilityState={{ disabled: !armed }}
          disabled={!armed}
          onPress={() => finish((Date.now() - shownAt.current) / 1000)}
          style={({ pressed }) => [styles.ready, !armed && styles.readyWaiting, pressed && styles.readyPressed]}
        >
          <Text style={styles.readyText}>I’m ready</Text>
        </Pressable>
      </View>
      <View style={styles.picture}>
        <SceneView spec={scene} fitToBox overlay={overlay} animate />
        {hint && showHint && (
          <Animated.View exiting={FadeOut.duration(400)} style={styles.hint} pointerEvents="none">
            <Text style={styles.hintText}>{hint}</Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bar: {
    height: layout.memoriseBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  ready: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyWaiting: { opacity: 0.4 },
  readyPressed: { backgroundColor: colors.surfaceRaised },
  readyText: { color: colors.accent, fontSize: 15, fontWeight: '800' },
  devButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtonOn: { borderColor: colors.accent, backgroundColor: colors.surfaceRaised },
  devText: { color: colors.text, fontSize: 18 },
  picture: { flex: 1 },
  hint: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'rgba(15,17,21,0.88)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.accent },
  hintText: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
});
