import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Countdown } from '@/components/Countdown';
import { QuitButton } from '@/components/QuitButton';
import { toggleLayoutOverlay, useLayoutOverlay } from '@/scenes/debugOverlay';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import { colors, layout } from '@/theme';

interface MemoriseStageProps {
  scene: SceneSpec;
  seconds: number;
  onDone: () => void;
  onQuit: () => void;
}

/**
 * The controls sit in a bar above the picture, never on top of it. The timer is on the left next to
 * the quit button, so nothing floating in the top-right corner (like Expo Go's tools button) can hide it.
 * The picture fills the rest, down to the bottom safe-area inset.
 */
export function MemoriseStage({ scene, seconds, onDone, onQuit }: MemoriseStageProps) {
  const overlay = useLayoutOverlay();
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
        {/* While the layout overlay is on, the timer waits so the layout can be checked. */}
        <Countdown seconds={seconds} running={!overlay} onComplete={onDone} />
      </View>
      <View style={styles.picture}>
        <SceneView spec={scene} fitToBox overlay={overlay} />
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
});
