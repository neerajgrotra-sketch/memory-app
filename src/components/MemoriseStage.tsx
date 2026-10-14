import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Countdown } from '@/components/Countdown';
import { VIEW_SECONDS } from '@/game/difficulty';
import { colors } from '@/theme';
import type { GameImage } from '@/types/game';

interface MemoriseStageProps {
  image: GameImage;
  onDone: () => void;
}

export function MemoriseStage({ image, onDone }: MemoriseStageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={image.source}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        transition={150}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        accessibilityLabel={image.title}
      />
      {!loaded && !failed && <ActivityIndicator style={styles.center} color={colors.accent} size="large" />}
      {failed && <Text style={[styles.center, styles.error]}>Couldn’t load the picture.</Text>}
      {loaded && <Countdown seconds={VIEW_SECONDS} running={loaded} onComplete={onDone} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { position: 'absolute', alignSelf: 'center', top: '50%' },
  error: { color: colors.text, fontSize: 16 },
});
