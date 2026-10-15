import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LevelRing } from '@/components/LevelRing';
import { titleFor, unlocksAt } from '@/games/lookRemember/ladder';
import { colors, radius } from '@/theme';

interface LevelUpScreenProps {
  level: number;
  onContinue: () => void;
}

/** Shown after a round that took you up a level: the new level, its title if it's a milestone, and what's new. */
export function LevelUpScreen({ level, onContinue }: LevelUpScreenProps) {
  const pop = useSharedValue(0.6);
  const fade = useSharedValue(0);
  useEffect(() => {
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
    fade.value = withDelay(250, withTiming(1, { duration: 350 }));
  }, [fade, pop]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const milestone = level % 5 === 0 || level === 1;
  const news = unlocksAt(level);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Text style={styles.kicker}>Level up!</Text>
        <Animated.View style={ringStyle}>
          <LevelRing ladder={{ level, progress: 0, poorStreak: 0, best: level }} size={150} />
        </Animated.View>
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.title}>{milestone ? `You’re now: ${titleFor(level)}` : `Welcome to Level ${level}`}</Text>
          <View style={styles.news}>
            <Text style={styles.newsTitle}>What’s new</Text>
            {news.map((line) => (
              <Text key={line} style={styles.newsLine}>
                • {line}
              </Text>
            ))}
          </View>
        </Animated.View>
      </View>
      <View style={styles.actions}>
        <Button label="See my results" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  kicker: { color: colors.accent, fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  textBlock: { alignItems: 'center', gap: 20, alignSelf: 'stretch' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  news: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 8 },
  newsTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  newsLine: { color: colors.text, fontSize: 16, lineHeight: 22 },
  actions: { padding: 24 },
});
