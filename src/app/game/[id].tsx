import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BossBadge } from '@/components/BossBadge';
import { Button } from '@/components/Button';
import { JourneyIcon } from '@/components/JourneyIcon';
import { GameArt } from '@/components/GameArt';
import { LevelRing } from '@/components/LevelRing';
import { PRACTICE_OPTIONS } from '@/game/difficulty';
import { MAX_LEVEL, ROUNDS_TO_LEVEL_UP, nextBigUnlock, nextTitle, titleFor } from '@/games/lookRemember/ladder';
import { BOSSES, BOSS_TO_WIN, bossesOpen } from '@/games/lookRemember/boss';
import { MAX_PEEKS, PEEK_POINTS, type PeekWallet } from '@/games/lookRemember/peeks';
import { formatPoints } from '@/games/lookRemember/points';
import { feedback } from '@/feedback';
import { getGame } from '@/games/registry';
import { myPlaces, placesOff, togglePlace } from '@/games/lookRemember/places';
import { useReloadableGameProgress } from '@/hooks/useGameProgress';
import { useProfile } from '@/profile';
import { clearSavedRound } from '@/games/lookRemember/savedRound';
import { statsStore } from '@/stats';
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
  const { progress, reload } = useReloadableGameProgress(gameId);
  const { profile } = useProfile();
  const unlimitedPeeks = profile?.tester === true && profile.testPeeks === true;
  // The rules, in a pop-up from the "How to play" button by the title.
  const [rulesOpen, setRulesOpen] = useState(false);
  // Starting again: ask first, then say it's done.
  const [startAgain, setStartAgain] = useState<'idle' | 'confirm' | 'done'>('idle');
  const restart = async () => {
    await statsStore.restart(gameId);
    // A round in progress was played at the old level.
    await clearSavedRound('play');
    setStartAgain('done');
    reload();
  };
  // Tester mode: jump straight to any level (a "start again" at that level), to test without climbing.
  const pickLevel = async (level: number) => {
    feedback('tick');
    await statsStore.restart(gameId, level);
    await clearSavedRound('play');
    setStartAgain('idle');
    reload();
  };
  const play = (mode: string) => {
    feedback('start');
    router.push({ pathname: '/play', params: { game: gameId, mode } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GameArt style={styles.art} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{game.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`How to play ${game.title}`}
              onPress={() => setRulesOpen(true)}
              hitSlop={6}
              style={({ pressed }) => [styles.howTo, pressed && styles.backPressed]}
            >
              <Text style={styles.howToText}>ⓘ How to play</Text>
            </Pressable>
          </View>
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

              {/* The main action, right under your level, so it's in view without scrolling. */}
              <Button label={`Play level ${progress.ladder.level}`} onPress={() => play('levels')} />
              <Button
                label="Your journey"
                icon={<JourneyIcon />}
                variant="secondary"
                accessibilityHint="The map of your trip: every level's stop and the places you've reached"
                onPress={() => {
                  feedback('tick');
                  router.push('/journey');
                }}
              />

              <View style={styles.tiles}>
                <Tile label="High score" value={progress.highScore ? formatPoints(progress.highScore) : '–'} />
                <Tile label="Best level" value={String(progress.ladder.best)} />
                <Tile label="Rounds played" value={String(progress.plays)} />
                <Tile label="Perfect rounds" value={String(progress.perfectRounds)} />
              </View>

              <View style={styles.peeks} accessible accessibilityLabel={peeksLine(progress.peeks)}>
                <Text style={styles.peeksCount}>
                  👀 {unlimitedPeeks ? 'Unlimited Peeks (tester mode)' : progress.peeks.peeks === 1 ? '1 Peek' : `${progress.peeks.peeks} Peeks`}
                </Text>
                <Text style={styles.peeksDetail}>{peeksLine(progress.peeks)}</Text>
              </View>

              <Bosses best={progress.ladder.best} beaten={progress.bossesBeaten} tester={profile?.tester === true} />

              {profile?.tester && <TesterPlay level={progress.ladder.level} onPlay={() => play('levels')} />}

              {profile?.tester && <PickLevel current={progress.ladder.level} onPick={pickLevel} />}

              {startAgain === 'done' ? (
                <Text style={styles.startedAgain}>You’re back at Level 1. Your high score, best level and history are kept.</Text>
              ) : startAgain === 'confirm' ? (
                <View style={styles.confirmCard}>
                  <Text style={styles.confirmTitle}>Start again from Level 1?</Text>
                  <Text style={styles.note}>
                    You’ll leave Level {progress.ladder.level}. Your high score, best level and round history stay. To delete everything instead, use Progress → Delete all progress.
                  </Text>
                  <Button label="Start again from Level 1" onPress={restart} />
                  <Button label={`Stay on Level ${progress.ladder.level}`} variant="secondary" onPress={() => setStartAgain('idle')} />
                </View>
              ) : (
                (progress.ladder.level > 1 || progress.ladder.progress > 0) && (
                  <Pressable accessibilityRole="button" onPress={() => setStartAgain('confirm')} hitSlop={6} style={styles.startAgainLink}>
                    <Text style={styles.startAgainText}>Start again from Level 1</Text>
                  </Pressable>
                )
              )}

              <MyPlaces level={progress.ladder.level} />

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

        </View>
      </ScrollView>
      <Modal visible={rulesOpen} transparent animationType="fade" onRequestClose={() => setRulesOpen(false)}>
        <Pressable style={styles.rulesBackdrop} onPress={() => setRulesOpen(false)} accessibilityRole="button" accessibilityLabel="Close">
          <Pressable style={styles.rulesSheet} onPress={() => {}}>
            <Text style={styles.rulesTitle}>How to play</Text>
            {game.howToPlay.map((step, i) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <Text style={styles.note}>
              {ROUNDS_TO_LEVEL_UP} good rounds (4 or 5 right) take you up a level. Two very poor rounds in a row (0 or 1 right) take you back one.
            </Text>
            <Text style={styles.note}>
              👀 Peeks: every {formatPoints(PEEK_POINTS)} points earns one (hold up to {MAX_PEEKS}). During the questions, a Peek shows the picture again for a few seconds; that answer earns half points.
            </Text>
            <Text style={styles.note}>
              👑 Boss rounds at Levels 10, 20 and 30: a busy picture, a shorter look and harder questions. Get {BOSS_TO_WIN} of 5 right to win the badge.
            </Text>
            <Button label="Got it" onPress={() => setRulesOpen(false)} />
            <Button
              label="Play the practice round"
              variant="secondary"
              onPress={() => {
                setRulesOpen(false);
                router.push({ pathname: '/guided', params: { replay: '1' } });
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
      {/* Back to the Games tab: outside the scroll, so it never scrolls away, and solid with a label and a
          light edge, so it shows on any picture behind it. */}
      <SafeAreaView edges={['top']} style={styles.backWrap} pointerEvents="box-none">
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Games" onPress={goBack} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
          <Text style={styles.backText}>←  Games</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

/** The three boss rounds: beaten (gold), ready to take on (red, tap to play), or still to reach (grey). */
function Bosses({ best, beaten, tester }: { best: number; beaten: Set<number>; tester: boolean }) {
  const open = bossesOpen(best, tester);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Boss rounds</Text>
      <Text style={styles.note}>A busy picture, a shorter look and harder questions. Get {BOSS_TO_WIN} of 5 right to win the badge. They never change your level.</Text>
      <View style={styles.bosses}>
        {BOSSES.map((b) => {
          const isOpen = open.includes(b);
          const won = beaten.has(b.level);
          const state = won ? 'beaten' : isOpen ? 'open' : 'locked';
          const status = won ? 'Beaten · play again' : isOpen ? 'Take it on' : `Reach Level ${b.level}`;
          return (
            <Pressable
              key={b.level}
              accessibilityRole="button"
              accessibilityLabel={`${b.badge}, Level ${b.level}: ${status}`}
              accessibilityState={{ disabled: !isOpen }}
              disabled={!isOpen}
              onPress={() => {
                feedback('start');
                router.push({ pathname: '/boss', params: { level: String(b.level) } });
              }}
              style={({ pressed }) => [styles.boss, pressed && styles.pressed]}
            >
              <BossBadge level={b.level} state={state} size={56} />
              <Text style={styles.bossName}>{b.badge}</Text>
              <Text style={[styles.bossStatus, state === 'open' && styles.bossStatusOpen]}>{status}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Tester mode: start each kind of round straight away, at your level (a boss at its own level). */
function TesterPlay({ level, onPlay }: { level: number; onPlay: () => void }) {
  return (
    <View style={[styles.section, styles.testerCard]}>
      <Text style={styles.sectionTitle}>Tester: play</Text>
      <Text style={styles.note}>Start any kind of round now. Results and prizes count as usual.</Text>
      <View style={styles.testerButtons}>
        <Button label={`Normal round · Level ${level}`} onPress={onPlay} />
        <Button
          label="Speed Round"
          variant="secondary"
          onPress={() => {
            feedback('start');
            router.push({ pathname: '/play', params: { game: 'look-remember', mode: 'levels', speed: '1' } });
          }}
        />
        <View style={styles.testerRow}>
          {BOSSES.map((b) => (
            <Pressable
              key={b.level}
              accessibilityRole="button"
              accessibilityLabel={`Play the ${b.badge} round`}
              onPress={() => {
                feedback('start');
                router.push({ pathname: '/boss', params: { level: String(b.level) } });
              }}
              style={({ pressed }) => [styles.testerBoss, pressed && styles.pressed]}
            >
              <Text style={styles.testerBossText}>Boss {b.level}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Tester mode: every level as a button; tap one to play from it. History, high score and best level are kept. */
function PickLevel({ current, onPick }: { current: number; onPick: (level: number) => void }) {
  return (
    <View style={[styles.section, styles.testerCard]}>
      <Text style={styles.sectionTitle}>Tester: play any level</Text>
      <Text style={styles.note}>Tap a level to play from it now. Your history, high score and best level are kept.</Text>
      <View style={styles.levelGrid}>
        {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((level) => {
          const on = level === current;
          return (
            <Pressable
              key={level}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Play from level ${level}`}
              onPress={() => onPick(level)}
              style={({ pressed }) => [styles.levelChip, on && styles.levelChipOn, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.levelChipText, on && styles.levelChipTextOn]}>{level}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * My Places: switch places on or off to train on the ones you choose. Places your level hasn't reached
 * show when they unlock; they join automatically then.
 */
function MyPlaces({ level }: { level: number }) {
  const { profile, update } = useProfile();
  const off = placesOff(profile);
  const tester = profile?.tester === true;
  const places = myPlaces(level, off, tester);
  const reached = places.filter((p) => p.reached);
  const onCount = reached.filter((p) => p.on).length;
  const toggle = (id: string) => {
    const next = togglePlace(level, off, id, tester);
    if (next) {
      feedback('tick');
      update({ placesOff: next, recipeFilter: null });
    }
  };
  return (
    <View style={styles.section}>
      <View style={styles.placesHeader}>
        <Text style={styles.sectionTitle}>My places</Text>
        <Text style={styles.placesCount}>{onCount === reached.length ? `All ${reached.length} on` : `${onCount} of ${reached.length} on`}</Text>
      </View>
      {tester && <Text style={styles.testerNote}>Tester mode: every place is unlocked. Turn it off in Profile.</Text>}
      <Text style={styles.note}>
        {reached.length > 1
          ? 'Train on the places you choose. Tap to switch one off; new places join as you unlock them.'
          : 'Level up to unlock more places, then pick the ones you want to train on.'}
      </Text>
      <View style={styles.places}>
        {places.map((p) => {
          const last = p.on && onCount === 1;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="switch"
              accessibilityLabel={p.reached ? p.title : `${p.title}, unlocks at Level ${p.level}`}
              accessibilityState={{ checked: p.on, disabled: !p.reached || last }}
              disabled={!p.reached || last}
              onPress={() => toggle(p.id)}
              style={({ pressed }) => [styles.place, p.on && styles.placeOn, !p.reached && styles.placeLocked, pressed && styles.pressed]}
            >
              <Text style={[styles.placeMark, p.on && styles.placeMarkOn]}>{p.reached ? (p.on ? '✓' : '') : '🔒'}</Text>
              <View style={styles.placeText}>
                <Text style={[styles.placeTitle, !p.on && styles.placeTitleOff]} numberOfLines={2}>
                  {p.title}
                </Text>
                {!p.reached && <Text style={styles.placeLevel}>Level {p.level}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      {onCount < reached.length && (
        <Pressable accessibilityRole="button" onPress={() => update({ placesOff: [], recipeFilter: null })} hitSlop={6} style={styles.allPlaces}>
          <Text style={styles.startAgainText}>Play all places</Text>
        </Pressable>
      )}
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

/** How Peeks work, and how far off the next one is. */
function peeksLine({ peeks, toward }: PeekWallet): string {
  const next = peeks >= MAX_PEEKS ? `You hold the most (${MAX_PEEKS}). Use one to earn more.` : `${formatPoints(PEEK_POINTS - toward)} points to the next.`;
  return `A second look at the picture while answering, once a round. ${next}`;
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
  bosses: { flexDirection: 'row', gap: 10 },
  boss: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 6 },
  bossName: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bossStatus: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  bossStatusOpen: { color: colors.bossText, fontWeight: '800' },
  screen: { flex: 1, backgroundColor: colors.background },
  peeks: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 4 },
  peeksCount: { color: colors.text, fontSize: 16, fontWeight: '800' },
  peeksDetail: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  // Phone-width column, centred on tablets and wide windows so the art isn't blown up.
  content: { paddingBottom: 40, width: '100%', maxWidth: 520, alignSelf: 'center' },
  art: { width: '100%' },
  backWrap: { position: 'absolute', top: 0, left: 0 },
  back: {
    margin: 12,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backPressed: { opacity: 0.7 },
  backText: { color: colors.text, fontSize: 17, fontWeight: '800' },
  body: { padding: 20, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: -12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', flexShrink: 1 },
  howTo: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  howToText: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  rulesBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  rulesSheet: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 14 },
  rulesTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
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
  testerButtons: { gap: 10 },
  testerRow: { flexDirection: 'row', gap: 8 },
  // Narrower than a Button, so three fit on a small phone.
  testerBoss: { flex: 1, minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.boss, alignItems: 'center', justifyContent: 'center' },
  testerBossText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  testerCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: { width: 48, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  levelChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  levelChipText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  levelChipTextOn: { color: colors.accentText },
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
  placesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testerNote: { color: colors.wrong, fontSize: 13, fontWeight: '700' },
  placesCount: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  places: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  place: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 52,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  placeOn: { borderColor: colors.accent },
  placeLocked: { opacity: 0.55, borderStyle: 'dashed' },
  placeMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '900',
    color: colors.background,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  placeMarkOn: { backgroundColor: colors.accent },
  placeText: { flex: 1 },
  placeTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  placeTitleOff: { color: colors.textMuted },
  placeLevel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  allPlaces: { alignSelf: 'flex-start', paddingVertical: 4 },
  startAgainLink: { alignSelf: 'center', padding: 8, marginTop: -8 },
  startAgainText: { color: colors.textMuted, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  confirmCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border },
  confirmTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  startedAgain: { color: colors.correct, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: -8 },
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
