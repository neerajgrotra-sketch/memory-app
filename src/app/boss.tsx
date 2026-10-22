import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BossRound } from '@/components/BossRound';
import { bossAt, bossesOpen } from '@/games/lookRemember/boss';
import { MAX_PEEKS } from '@/games/lookRemember/peeks';
import { loadProgress, type GameProgress } from '@/hooks/useGameProgress';
import { EXTRA_SECONDS, useProfile } from '@/profile';
import { colors, layout } from '@/theme';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** A boss round (`/boss?level=10`), from the game page or the level-up screen. Only for a boss you've reached. */
export default function BossScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const boss = bossAt(Number(level));
  const { profile } = useProfile();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  useEffect(() => {
    loadProgress('look-remember').then(setProgress);
  }, []);
  // The picture is laid out for the space below the countdown bar, as in a normal round.
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = { width: Math.max(1, width - insets.left - insets.right), height: Math.max(1, height - insets.top - insets.bottom - layout.memoriseBarHeight) };

  const open = !!boss && !!progress && bossesOpen(progress.ladder.best, profile?.tester === true).includes(boss);
  useEffect(() => {
    if (progress && !open) goBack();
  }, [open, progress]);
  if (!boss || !progress || !open) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  return (
    <View style={styles.screen}>
      <BossRound
        boss={boss}
        size={size}
        extraSeconds={profile?.moreTime ? EXTRA_SECONDS : 0}
        beatenBefore={progress.bossesBeaten.has(boss.level)}
        peekRoom={progress.peeks.peeks < MAX_PEEKS}
        onDone={goBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
