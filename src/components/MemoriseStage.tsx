import { StyleSheet, View } from 'react-native';

import { Countdown } from '@/components/Countdown';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';

interface MemoriseStageProps {
  scene: SceneSpec;
  seconds: number;
  onDone: () => void;
}

export function MemoriseStage({ scene, seconds, onDone }: MemoriseStageProps) {
  return (
    <View style={styles.container}>
      <SceneView spec={scene} />
      <Countdown seconds={seconds} running onComplete={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
