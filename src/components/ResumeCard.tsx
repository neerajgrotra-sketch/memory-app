import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { feedback } from '@/feedback';
import { answeredOf, loadSavedRound, type SavedRound } from '@/games/lookRemember/savedRound';
import { LEVEL_LABELS } from '@/game/difficulty';
import { colors, radius } from '@/theme';

/**
 * A Levels or Practice round closed part way through, at the top of the Games tab: Resume goes straight
 * back to its next question. (A Daily Challenge in progress shows on the Daily card instead.)
 */
export function ResumeCard() {
  const [saved, setSaved] = useState<SavedRound | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      loadSavedRound('play').then((s) => {
        if (live) setSaved(s);
      });
      return () => {
        live = false;
      };
    }, []),
  );
  if (!saved) return null;

  const where = saved.mode === 'levels' ? `Level ${saved.round.level}` : `Practice, ${LEVEL_LABELS[saved.round.band]}`;
  const resume = () => {
    feedback('start');
    router.push({ pathname: '/play', params: { game: 'look-remember', mode: saved.mode, resume: '1' } });
  };
  return (
    <View style={styles.card}>
      <View style={styles.text}>
        <Text style={styles.kicker}>Round in progress</Text>
        <Text style={styles.title}>{saved.stage.title}</Text>
        <Text style={styles.meta}>
          Look & Remember · {where} · {answeredOf(saved)} of {saved.round.questions.length} answered
        </Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Resume your round" onPress={resume} style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
        <Text style={styles.pillText}>Resume</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 14,
  },
  text: { flex: 1, gap: 2 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  pill: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  pillText: { color: colors.accentText, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
