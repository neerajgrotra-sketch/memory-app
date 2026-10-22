import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JourneyMap } from '@/components/JourneyMap';
import { StopIntro } from '@/components/StopIntro';
import { feedback } from '@/feedback';
import { JOURNEY, isPlaceStop, type Stop } from '@/games/lookRemember/journey';
import { MAX_LEVEL } from '@/games/lookRemember/ladder';
import { useGameProgress } from '@/hooks/useGameProgress';
import { colors, radius } from '@/theme';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * The journey map (`/journey`, or `/journey?arrive=10` straight after reaching Level 10, when the marker travels
 * there). Tapping a stop opens its card; Explore plays a round in that place.
 */
export default function JourneyScreen() {
  const { arrive } = useLocalSearchParams<{ arrive?: string }>();
  const progress = useGameProgress('look-remember');
  const [open, setOpen] = useState<{ stop: Stop; arrived: boolean } | null>(null);
  if (!progress) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  const { level, best } = progress.ladder;
  const places = JOURNEY.filter((s) => isPlaceStop(s) && s.level <= best).length;
  const play = (params: Record<string, string>) => {
    feedback('start');
    setOpen(null);
    router.replace({ pathname: '/play', params: { game: 'look-remember', mode: 'levels', ...params } });
  };
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Your journey</Text>
          <Text style={styles.subtitle}>
            Level {level} of {MAX_LEVEL} · {places} of {JOURNEY.filter(isPlaceStop).length} places
          </Text>
        </View>
      </View>
      <JourneyMap level={level} best={best} arrive={arrive ? Number(arrive) : undefined} onOpen={(stop, arrived) => setOpen({ stop, arrived })} />
      <StopIntro
        stop={open?.stop ?? null}
        arrived={open?.arrived ?? false}
        level={level}
        best={best}
        onExplore={(recipeId) => play({ place: recipeId })}
        onPlay={() => play({})}
        onBoss={(l) => {
          feedback('start');
          setOpen(null);
          router.push({ pathname: '/boss', params: { level: String(l) } });
        }}
        onClose={() => setOpen(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 22, fontWeight: '800' },
  pressed: { opacity: 0.7 },
  headerText: { flex: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
});
