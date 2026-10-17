import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { feedback } from '@/feedback';
import { dailyResultOn, streakOf, weekOf, type Streak } from '@/games/lookRemember/daily';
import { formatPoints } from '@/games/lookRemember/points';
import { statsStore } from '@/stats';
import { colors, radius } from '@/theme';
import type { RoundResult } from '@/types/stats';

/**
 * The daily habit on the Games tab: your streak, this week's days, and today's challenge (one picture,
 * double points, one try). Reloaded whenever the tab comes into view, so it's right after a round.
 */
export function DailyCard() {
  const [data, setData] = useState<{ streak: Streak; week: ReturnType<typeof weekOf>; today: RoundResult | null } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      statsStore.listResults().then((all) => {
        if (live) setData({ streak: streakOf(all), week: weekOf(all), today: dailyResultOn(all) });
      });
      return () => {
        live = false;
      };
    }, []),
  );
  if (!data) return null;
  const { streak, week, today } = data;

  const streakLine =
    streak.current === 0
      ? 'Start a streak today'
      : streak.playedToday
        ? `${streak.current}-day streak`
        : `Play today to keep your ${streak.current}-day streak`;

  const play = () => {
    feedback('start');
    router.push({ pathname: '/play', params: { game: 'look-remember', mode: 'daily' } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={[styles.flame, streak.current === 0 && styles.flameOff]}>🔥</Text>
        <View style={styles.streakText}>
          <Text style={styles.streakTitle}>{streakLine}</Text>
          {streak.best > 1 && <Text style={styles.meta}>Best: {streak.best} days</Text>}
        </View>
      </View>

      <View style={styles.week} accessible accessibilityLabel={`This week: played on ${week.filter((d) => d.played).length} days`}>
        {week.map((d) => (
          <View key={d.day} style={styles.day}>
            <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>{d.label}</Text>
            <View style={[styles.dot, d.played && styles.dotPlayed, d.isToday && !d.played && styles.dotToday, d.future && styles.dotFuture]}>
              {d.played && <Text style={styles.tick}>✓</Text>}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.challenge}>
        <View style={styles.challengeText}>
          <Text style={styles.kicker}>Today’s challenge</Text>
          {today ? (
            <Text style={styles.meta}>
              Done ✓ {today.score} of {today.total} right · {formatPoints(today.points ?? 0)} points. A new one tomorrow.
            </Text>
          ) : (
            <Text style={styles.meta}>One special picture · double points · one try</Text>
          )}
        </View>
        {!today && (
          <Pressable accessibilityRole="button" accessibilityLabel="Play today’s challenge" onPress={play} style={({ pressed }) => [styles.playPill, pressed && styles.pressed]}>
            <Text style={styles.playPillText}>Play</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const DOT = 28;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flame: { fontSize: 30 },
  flameOff: { opacity: 0.35 },
  streakText: { flex: 1, gap: 1 },
  streakTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dayLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  dayLabelToday: { color: colors.accent },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPlayed: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotToday: { borderColor: colors.accent, borderStyle: 'dashed' },
  dotFuture: { opacity: 0.4 },
  tick: { color: colors.accentText, fontSize: 14, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border },
  challenge: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeText: { flex: 1, gap: 2 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  playPill: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  playPillText: { color: colors.accentText, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
