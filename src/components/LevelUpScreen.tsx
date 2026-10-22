import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  /** On along the journey: the map, where the marker travels to the new level's stop. */
  onPlay: () => void;
  /** To the round's results and answers first. */
  onContinue: () => void;
  /** Leave the game (the new level is already saved). */
  onClose: () => void;
  /** A boss level: take on its boss round. */
  onBoss?: () => void;
}

/** Shown after a round that took you up a level: the new level, its title if it's a milestone, and what's new. */
export function LevelUpScreen({ level, onPlay, onContinue, onClose, onBoss }: LevelUpScreenProps) {
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

  // A smaller ring on a short phone (iPhone SE), so the news and the buttons fit; the news scrolls if it still doesn't.
  const { height } = useWindowDimensions();
  const ringSize = height < 740 ? 110 : 150;
  const milestone = level % 5 === 0 || level === 1;
  const news = unlocksAt(level);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.close}>
        <QuitButton onPress={onClose} label="Close, your new level is saved" />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.center}>
        <Text style={styles.kicker}>Level up!</Text>
        <Animated.View style={ringStyle}>
          <LevelUpRing level={level} size={ringSize} />
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
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Continue your journey"
          // The map plays its own travel sound.
          onPress={onPlay}
        />
        {/* Side by side with a boss to take on, so three buttons leave room for the news on a small phone. */}
        <View style={styles.secondary}>
          {onBoss && (
            <View style={styles.half}>
              <Button label="Boss round" variant="secondary" onPress={onBoss} accessibilityHint="Take on this level’s boss" />
            </View>
          )}
          <View style={styles.half}>
            <Button label={onBoss ? 'My results' : 'See my results'} variant="secondary" onPress={onContinue} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  close: { paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  scroll: { flex: 1 },
  secondary: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  center: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  kicker: { color: colors.accent, fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  textBlock: { alignItems: 'center', gap: 20, alignSelf: 'stretch' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  news: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 8 },
  newsTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  newsLine: { color: colors.text, fontSize: 16, lineHeight: 22 },
  actions: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
