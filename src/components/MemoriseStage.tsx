import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Countdown } from '@/components/Countdown';
import { QuitButton } from '@/components/QuitButton';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import { colors, layout } from '@/theme';

interface MemoriseStageProps {
  scene: SceneSpec;
  seconds: number;
  onDone: () => void;
  onQuit: () => void;
}

/** The controls sit in a bar above the picture, never on top of it, so nothing in the picture is hidden. */
export function MemoriseStage({ scene, seconds, onDone, onQuit }: MemoriseStageProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.bar}>
        <QuitButton onPress={onQuit} />
        <Countdown seconds={seconds} running onComplete={onDone} />
      </View>
      <View style={styles.picture}>
        <SceneView spec={scene} />
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
    gap: 14,
    paddingHorizontal: 16,
  },
  picture: { flex: 1 },
});
