import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameArt } from '@/components/GameArt';
import { LevelRing } from '@/components/LevelRing';
import { SoundToggle } from '@/components/SoundToggle';
import { titleFor } from '@/games/lookRemember/ladder';
import { GAMES, SKILLS, SKILL_ORDER, type GameDef } from '@/games/registry';
import { useGameProgress } from '@/hooks/useGameProgress';
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

        {/* Once you've played, a slim strip to carry on at your level. New players start from the game card below. */}
        {played && progress && (
          <View style={styles.continue}>
            <LevelRing ladder={progress.ladder} size={52} />
            <View style={styles.continueText}>
              <Text style={styles.kicker}>Continue</Text>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {featured.title}
              </Text>
              <Text style={styles.continueMeta} numberOfLines={1}>
                {titleFor(progress.ladder.level)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Play ${featured.title}, level ${progress.ladder.level}`}
              onPress={() => playLevels(featured)}
              style={({ pressed }) => [styles.playPill, pressed && styles.pressed]}
            >
              <Text style={styles.playPillText}>Play</Text>
            </Pressable>
          </View>
        )}
        {progress && !played && <Text style={styles.intro}>New here? Tap a game to see how it works, then play.</Text>}

        {progress && <MyPlacesNote level={progress.ladder.level} gameId={featured.id} />}
        {profile?.moreTime && <Text style={styles.moreTime}>More time to look is on: every picture stays {EXTRA_SECONDS} seconds longer.</Text>}

        {/* Games grouped by skill. A skill only shows once it has a game. */}
        {SKILL_ORDER.map((skill) => {
          const games = GAMES.filter((g) => g.skill === skill);
          if (!games.length) return null;
          return (
            <View key={skill} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{SKILLS[skill].title}</Text>
                <Text style={styles.sectionBlurb}>{SKILLS[skill].blurb}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>
          );
        })}

        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ game }: { game: GameDef }) {
  const progress = useGameProgress(game.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.title}${progress ? `, level ${progress.ladder.level}` : ''}`}
      onPress={() => openGame(game)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <GameArt style={styles.cardArt} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{game.title}</Text>
        <Text style={styles.cardMeta}>{progress ? `Level ${progress.ladder.level}` : ' '}</Text>
      </View>
    </Pressable>
  );
}

/** When some places are switched off (My Places), says which are played; tap to change them. */
function MyPlacesNote({ level, gameId }: { level: number; gameId: string }) {
  const { profile } = useProfile();
  const places = myPlaces(level, placesOff(profile)).filter((p) => p.reached);
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
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  continueText: { flex: 1, gap: 1 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  continueTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  continueMeta: { color: colors.textMuted, fontSize: 13 },
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
  cards: { gap: 12, paddingRight: 16 },
  card: { width: 220, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  cardArt: { width: '100%' },
  cardBody: { padding: 12, gap: 2 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  cardMeta: { color: colors.textMuted, fontSize: 13 },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
