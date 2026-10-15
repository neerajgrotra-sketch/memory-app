import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { GameArt } from '@/components/GameArt';
import { LevelRing } from '@/components/LevelRing';
import { PRACTICE_OPTIONS } from '@/game/difficulty';
import { MAX_LEVEL, ROUNDS_TO_LEVEL_UP, nextBigUnlock, nextTitle, titleFor } from '@/games/lookRemember/ladder';
import { formatPoints } from '@/games/lookRemember/points';
import { getGame } from '@/games/registry';
import { useGameProgress } from '@/hooks/useGameProgress';
import { colors, radius } from '@/theme';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** A game's own page: your level and records, Play, Practice, and how to play. */
export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = getGame(id);
  if (!game) return <Redirect href="/" />;
  return <GamePage gameId={game.id} />;
}

function GamePage({ gameId }: { gameId: 'look-remember' }) {
  const game = getGame(gameId)!;
  const progress = useGameProgress(gameId);
  const play = (mode: string) => router.push({ pathname: '/play', params: { game: gameId, mode } });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GameArt style={styles.art} />
        <SafeAreaView edges={['top']} style={styles.backWrap} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={8} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        </SafeAreaView>

        <View style={styles.body}>
          <Text style={styles.title}>{game.title}</Text>
          <Text style={styles.tagline}>{game.tagline}</Text>

          {!progress ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <View style={styles.levelCard}>
                <LevelRing ladder={progress.ladder} size={96} />
                <View style={styles.levelText}>
                  <Text style={styles.levelTitle}>{titleFor(progress.ladder.level)}</Text>
                  <Text style={styles.levelDetail}>{toNext(progress.ladder.level, progress.ladder.progress)}</Text>
                  {(() => {
                    const big = nextBigUnlock(progress.ladder.level);
                    return big ? <Text style={styles.levelDetail}>Level {big.level}: {big.text}</Text> : null;
                  })()}
                </View>
              </View>
              {progress.fromHistory && (
                <Text style={styles.note}>You start at Level {progress.ladder.level}, based on how you did in earlier rounds.</Text>
              )}

              <View style={styles.tiles}>
                <Tile label="High score" value={progress.highScore ? formatPoints(progress.highScore) : '–'} />
                <Tile label="Best level" value={String(progress.ladder.best)} />
                <Tile label="Rounds played" value={String(progress.plays)} />
                <Tile label="Perfect rounds" value={String(progress.perfectRounds)} />
              </View>

              <Button label={`Play level ${progress.ladder.level}`} onPress={() => play('levels')} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Practice</Text>
                <Text style={styles.note}>Pick a difficulty to warm up. Practice earns points but never changes your level.</Text>
                <View style={styles.practice}>
                  {PRACTICE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityLabel={`Practice ${option.label}. ${option.description}`}
                      onPress={() => play(option.value)}
                      style={({ pressed }) => [styles.practiceItem, pressed && styles.pressed]}
                    >
                      <Text style={styles.practiceLabel}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to play</Text>
            {game.howToPlay.map((step, i) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <Text style={styles.note}>
              {ROUNDS_TO_LEVEL_UP} good rounds (4 or 5 right) take you up a level. Two very poor rounds in a row (0 or 1 right) take you back one.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function toNext(level: number, progress: number) {
  if (level >= MAX_LEVEL) return 'Top level reached. Keep your crown!';
  const left = ROUNDS_TO_LEVEL_UP - progress;
  const milestone = nextTitle(level);
  const next = `${left} more good ${left === 1 ? 'round' : 'rounds'} to Level ${level + 1}`;
  return milestone && milestone.from === level + 1 ? `${next}: ${milestone.title}` : next;
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  // Phone-width column, centred on tablets and wide windows so the art isn't blown up.
  content: { paddingBottom: 40, width: '100%', maxWidth: 520, alignSelf: 'center' },
  art: { height: 180 },
  backWrap: { position: 'absolute', top: 0, left: 0 },
  back: {
    margin: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15,17,21,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  body: { padding: 20, gap: 20 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginBottom: -12 },
  tagline: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.surface, borderRadius: radius.md, padding: 16 },
  levelText: { flex: 1, gap: 4 },
  levelTitle: { color: colors.accent, fontSize: 20, fontWeight: '900' },
  levelDetail: { color: colors.textMuted, fontSize: 14, lineHeight: 19 },
  note: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: '40%', backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 2 },
  tileValue: { color: colors.text, fontSize: 26, fontWeight: '900', fontVariant: ['tabular-nums'] },
  tileLabel: { color: colors.textMuted, fontSize: 13 },
  section: { gap: 10 },
  sectionTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  practice: { flexDirection: 'row', gap: 10 },
  practiceItem: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  practiceLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '900',
    overflow: 'hidden',
  },
  stepText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 },
});
