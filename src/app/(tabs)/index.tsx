import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyCard } from '@/components/DailyCard';
import { ResumeCard } from '@/components/ResumeCard';
import { GameThumb } from '@/components/GameArt';
import { LevelRing } from '@/components/LevelRing';
import { SoundToggle } from '@/components/SoundToggle';
import { titleFor } from '@/games/lookRemember/ladder';
import { PLANNED_GAMES, PlannedGameRow } from '@/games/ComingSoon';
import { GAMES, SKILLS, SKILL_ORDER, type GameDef } from '@/games/registry';
import { useAllGameProgress, useGameProgress, type GameProgress } from '@/hooks/useGameProgress';
import { feedback } from '@/feedback';
import { EXTRA_SECONDS, useProfile } from '@/profile';
import { myPlaces, placesOff } from '@/games/lookRemember/places';
import { colors, radius } from '@/theme';
import { APP_VERSION } from '@/version';

const playLevels = (game: GameDef) => {
  feedback('start');
  router.push({ pathname: '/play', params: { game: game.id, mode: 'levels' } });
};
const openGame = (game: GameDef) => router.push({ pathname: '/game/[id]', params: { id: game.id } });

export default function GamesScreen() {
  const { profile } = useProfile();
  const featured = GAMES[0];
  const progress = useGameProgress(featured.id);
  const played = (progress?.plays ?? 0) > 0;
  const all = useAllGameProgress(GAMES.map((g) => g.id));
  // The game played most recently, marked "Continue" on its row.
  const lastPlayed = GAMES.map((g) => ({ id: g.id, at: all?.[g.id]?.lastPlayedAt ?? null }))
    .filter((g) => g.at)
    .sort((a, b) => b.at!.localeCompare(a.at!))[0]?.id;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.brand}>glance</Text>
            <Text style={styles.greeting}>{profile?.name ? `Hi, ${profile.name}` : 'Brain games, one glance at a time'}</Text>
          </View>
          <SoundToggle />
        </View>

        {/* A round closed part way through, to pick up where you left off. */}
        <ResumeCard />

        {/* The daily habit (streak, this week, today's challenge), once you've played a first round. */}
        {played && <DailyCard />}

        {progress && !played && <Text style={styles.intro}>New here? Tap a game to see how it works, then play.</Text>}

        {progress && <MyPlacesNote level={progress.ladder.level} gameId={featured.id} />}
        {profile?.moreTime && <Text style={styles.moreTime}>More time to look is on: every picture stays {EXTRA_SECONDS} seconds longer.</Text>}

        {/* Games grouped by skill, one full-width row each, so every game is in view and each carries its own
            level and Play. Within a skill the most recently played comes first, and the game played last of all
            is marked "Continue". A skill only shows once it has a game; in tester mode, planned games appear too
            ("Coming soon"), to preview the hub with more games. */}
        {SKILL_ORDER.map((skill) => {
          const games = GAMES.filter((g) => g.skill === skill).sort((a, b) => (all?.[b.id]?.lastPlayedAt ?? '').localeCompare(all?.[a.id]?.lastPlayedAt ?? ''));
          const planned = profile?.tester ? PLANNED_GAMES.filter((g) => g.skill === skill) : [];
          if (!games.length && !planned.length) return null;
          return (
            <View key={skill} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{SKILLS[skill].title}</Text>
                <Text style={styles.sectionBlurb}>{SKILLS[skill].blurb}</Text>
              </View>
              <View style={styles.rows}>
                {games.map((game) => (
                  <GameRow key={game.id} game={game} progress={all?.[game.id] ?? null} last={game.id === lastPlayed} />
                ))}
                {planned.map((game) => (
                  <PlannedGameRow key={game.id} game={game} />
                ))}
              </View>
            </View>
          );
        })}

        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * A game's row: its picture, title, your level (ring and title) and Play, which goes straight in at your
 * level. Tapping anywhere else opens the game's page. A game not played yet says "Try it".
 */
function GameRow({ game, progress, last }: { game: GameDef; progress: GameProgress | null; last: boolean }) {
  const played = (progress?.plays ?? 0) > 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.title}${progress ? `, level ${progress.ladder.level}` : ''}`}
      onPress={() => openGame(game)}
      style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && styles.pressed]}
    >
      <GameThumb style={styles.thumb} />
      <View style={styles.rowBody}>
        {last && <Text style={styles.kicker}>Continue</Text>}
        <Text style={styles.rowTitle} numberOfLines={1}>
          {game.title}
        </Text>
        {progress && played ? (
          <View style={styles.rowLevel}>
            <LevelRing ladder={progress.ladder} size={34} />
            <Text style={styles.rowMeta} numberOfLines={1}>
              {titleFor(progress.ladder.level)}
            </Text>
          </View>
        ) : (
          <Text style={styles.rowMeta} numberOfLines={2}>
            {game.tagline}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={played && progress ? `Play ${game.title}, level ${progress.ladder.level}` : `Try ${game.title}`}
        onPress={() => (played ? playLevels(game) : openGame(game))}
        hitSlop={6}
        style={({ pressed }) => [styles.playPill, pressed && styles.pressed]}
      >
        <Text style={styles.playPillText}>{played ? 'Play' : 'Try it'}</Text>
      </Pressable>
    </Pressable>
  );
}

/** When some places are switched off (My Places), says which are played; tap to change them. */
function MyPlacesNote({ level, gameId }: { level: number; gameId: string }) {
  const { profile } = useProfile();
  const places = myPlaces(level, placesOff(profile), profile?.tester === true).filter((p) => p.reached);
  const on = places.filter((p) => p.on);
  if (on.length === places.length) return null;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/game/[id]', params: { id: gameId } })} style={styles.noteWrap}>
      <Text style={styles.placesNote}>
        My places: {on.map((p) => p.title).join(', ')}. <Text style={styles.placesLink}>Change</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Phone-width column, centred on tablets and wide windows so nothing is blown up.
  container: { padding: 16, paddingBottom: 32, gap: 24, width: '100%', maxWidth: 520, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  header: { flex: 1, gap: 2, paddingHorizontal: 4 },
  brand: { color: colors.accent, fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  greeting: { color: colors.textMuted, fontSize: 16 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  playPill: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  playPillText: { color: colors.accentText, fontSize: 16, fontWeight: '800' },
  intro: { color: colors.textMuted, fontSize: 15, lineHeight: 21, paddingHorizontal: 4, marginBottom: -8 },
  noteWrap: { minHeight: 44, justifyContent: 'center', marginVertical: -12 },
  placesNote: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  placesLink: { color: colors.accent, fontWeight: '700' },
  moreTime: { color: colors.accent, fontSize: 14, textAlign: 'center', marginVertical: -8 },
  section: { gap: 12 },
  sectionHead: { paddingHorizontal: 4, gap: 2 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  sectionBlurb: { color: colors.textMuted, fontSize: 14 },
  rows: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    minHeight: 96,
  },
  // The game played last: an accent edge, so carrying on is one glance away.
  rowLast: { borderColor: colors.accent, borderWidth: 1.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  thumb: { width: 76, height: 76, borderRadius: 10 },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  rowLevel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowMeta: { color: colors.textMuted, fontSize: 13, flexShrink: 1 },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
