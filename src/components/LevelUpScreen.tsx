import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LevelUpRing } from '@/components/LevelUpRing';
import { QuitButton } from '@/components/QuitButton';
import { feedback } from '@/feedback';
import { titleFor, unlocksAt } from '@/games/lookRemember/ladder';
import { colors, radius } from '@/theme';

interface LevelUpScreenProps {
  level: number;
  /** Straight on to a new picture at the new level. */
  onPlay: () => void;
  /** To the round's results and answers first. */
  onContinue: () => void;
  /** Leave the game (the new level is already saved). */
  onClose: () => void;
}

/** Shown after a round that took you up a level: the new level, its title if it's a milestone, and what's new. */
export function LevelUpScreen({ level, onPlay, onContinue, onClose }: LevelUpScreenProps) {
  const pop = useSharedValue(0.6);
  const fade = useSharedValue(0);
  useEffect(() => {
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
    // The text waits for the ring's moment (the new number pops in at about 0.8 s).
    fade.value = withDelay(900, withTiming(1, { duration: 400 }));
    // The flourish lands as the ring spins and the new number pops in.
    const t = setTimeout(() => feedback('levelUp'), 500);
    // And the crowd joins in as the new number lands.
    const cheer = setTimeout(() => feedback('roundPerfect'), 950);
    return () => {
      clearTimeout(t);
      clearTimeout(cheer);
    };
  }, [fade, pop]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const milestone = level % 5 === 0 || level === 1;
  const news = unlocksAt(level);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.close}>
        <QuitButton onPress={onClose} label="Close, your new level is saved" />
      </View>
      <View style={styles.center}>
        <Text style={styles.kicker}>Level up!</Text>
        <Animated.View style={ringStyle}>
          <LevelUpRing level={level} size={150} />
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
        <Button
          label={`Play Level ${level}`}
          // The start sound is played by `onPlay`: a Super Speed Round has its own.
          onPress={onPlay}
        />
        <Button label="See my results" variant="secondary" onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  close: { paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  center: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  kicker: { color: colors.accent, fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  textBlock: { alignItems: 'center', gap: 20, alignSelf: 'stretch' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  news: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 8 },
  newsTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  newsLine: { color: colors.text, fontSize: 16, lineHeight: 22 },
  actions: { padding: 24, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
