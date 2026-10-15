import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ScoreChart } from '@/components/ScoreChart';
import { DIFFICULTY_OPTIONS, LEVEL_LABELS } from '@/game/difficulty';
import { statsStore } from '@/stats';
import { summarize, type StatsSummary, type Trend } from '@/stats/summarize';
import { colors, levelColors, radius } from '@/theme';
import type { QuestionType } from '@/types/game';

const TYPE_LABELS: Record<QuestionType, string> = {
  object: 'Objects',
  count: 'Counting',
  colour: 'Colours',
  position: 'Positions',
};

const fmt = (n: number) => n.toFixed(1);

function headline(trend: Trend | null): { title: string; detail: string } {
  if (!trend) return { title: 'Keep playing', detail: 'Play at least 4 rounds to see whether you’re improving.' };
  const recent = `Your last ${trend.window} rounds average ${fmt(trend.recentAverage)} out of 5`;
  switch (trend.direction) {
    case 'up':
      return { title: 'You’re getting sharper', detail: `${recent}, up from ${fmt(trend.previousAverage)}.` };
    case 'down':
      return { title: 'A little off the pace', detail: `${recent}, down from ${fmt(trend.previousAverage)}.` };
    case 'steady':
      return { title: 'Holding steady', detail: `${recent}, about the same as before (${fmt(trend.previousAverage)}).` };
  }
}

function trendText(trend: Trend | null) {
  if (!trend) return '';
  const delta = trend.recentAverage - trend.previousAverage;
  if (trend.direction === 'up') return `↑ ${fmt(delta)}`;
  if (trend.direction === 'down') return `↓ ${fmt(-delta)}`;
  return '→ steady';
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function StatsScreen() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const load = useCallback(() => {
    statsStore.listResults().then((results) => setSummary(summarize(results)));
  }, []);

  useFocusEffect(load);

  const reset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await statsStore.clear();
    setConfirmReset(false);
    load();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Your progress</Text>
      </View>

      {!summary ? (
        <ActivityIndicator style={styles.loading} color={colors.accent} size="large" />
      ) : summary.rounds === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No rounds yet</Text>
          <Text style={styles.emptyText}>
            Finish a round and your scores, sessions and progress per difficulty will show up here.
          </Text>
          <Button label="Play a round" onPress={() => router.replace({ pathname: '/play', params: { difficulty: 'easy' } })} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{headline(summary.trend).title}</Text>
            <Text style={styles.heroDetail}>{headline(summary.trend).detail}</Text>
          </View>

          <View style={styles.tiles}>
            <Tile label="Rounds played" value={String(summary.rounds)} />
            <Tile label="Sessions" value={String(summary.sessions)} />
            <Tile label="Average score" value={fmt(summary.average)} suffix="/ 5" />
            <Tile label="Perfect rounds" value={String(summary.perfectRounds)} />
          </View>

          <Section title={`Last ${summary.recentRounds.length} rounds`}>
            <ScoreChart rounds={summary.recentRounds} />
          </Section>

          <Section title="By difficulty">
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHead]}>
                <Text style={[styles.th, styles.colName]}>Level</Text>
                <Text style={styles.th}>Rounds</Text>
                <Text style={styles.th}>Avg</Text>
                <Text style={styles.th}>Best</Text>
                <Text style={[styles.th, styles.colTrend]}>Trend</Text>
              </View>
              {summary.levels.map((level) => (
                <View key={level.level} style={styles.tableRow}>
                  <View style={[styles.colName, styles.levelName]}>
                    <View style={[styles.swatch, { backgroundColor: levelColors[level.level] }]} />
                    <Text style={styles.td}>{LEVEL_LABELS[level.level]}</Text>
                  </View>
                  <Text style={styles.tdNum}>{level.rounds}</Text>
                  <Text style={styles.tdNum}>{level.rounds ? fmt(level.average) : '–'}</Text>
                  <Text style={styles.tdNum}>{level.rounds ? level.best : '–'}</Text>
                  <Text style={[styles.tdMuted, styles.colTrend]}>{trendText(level.trend) || (level.rounds ? 'need 4' : '')}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="By question type">
            <View style={styles.types}>
              {summary.types.map((t) => (
                <View key={t.type} style={styles.typeRow}>
                  <View style={styles.typeHead}>
                    <Text style={styles.td}>{TYPE_LABELS[t.type]}</Text>
                    <Text style={styles.tdMuted}>
                      {t.total ? `${Math.round(t.accuracy * 100)}%  (${t.correct}/${t.total})` : 'not asked yet'}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${t.accuracy * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
            <WeakSpot summary={summary} />
          </Section>

          <Section title="Your practice">
            <View style={styles.tiles}>
              <Tile label="Days played" value={String(summary.practice.daysPlayed)} />
              <Tile label="Day streak" value={String(summary.practice.streak)} />
            </View>
            <Text style={styles.note}>{steadiness(summary.practice.spread)}</Text>
            {summary.practice.typeChanges.length > 0 && (
              <View style={styles.types}>
                {summary.practice.typeChanges.map((c) => (
                  <View key={c.type} style={styles.typeHead}>
                    <Text style={styles.td}>{TYPE_LABELS[c.type]}</Text>
                    <Text style={styles.tdMuted}>
                      {Math.round(c.before * 100)}% → <Text style={styles.td}>{Math.round(c.after * 100)}%</Text>
                      {'  '}
                      {changeArrow(c.after - c.before)}
                    </Text>
                  </View>
                ))}
                <Text style={styles.note}>Your last 10 rounds compared with the 10 before.</Text>
              </View>
            )}
          </Section>

          <Section title="Recent sessions">
            <View style={styles.sessions}>
              {summary.recentSessions.map((s, i) => (
                <View key={s.id} style={[styles.sessionRow, i > 0 && styles.sessionDivider]}>
                  <View style={styles.sessionMain}>
                    <Text style={styles.td}>{DIFFICULTY_OPTIONS.find((o) => o.value === s.mode)?.label ?? s.mode}</Text>
                    <Text style={styles.sessionMeta}>
                      {formatDate(s.startedAt)} · {s.rounds} {s.rounds === 1 ? 'round' : 'rounds'}
                    </Text>
                  </View>
                  <Text style={styles.sessionScore}>
                    {fmt(s.average)}
                    <Text style={styles.tdMuted}> avg</Text>
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Text style={styles.disclaimer}>glance is a memory game, not a medical test. These numbers compare you only with yourself.</Text>

          <Pressable accessibilityRole="button" onPress={reset} onBlur={() => setConfirmReset(false)} style={styles.reset}>
            <Text style={[styles.resetText, confirmReset && styles.resetConfirm]}>
              {confirmReset ? 'Tap again to delete all progress' : 'Reset progress'}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function steadiness(spread: number | null) {
  if (spread === null) return 'Play 5 rounds to see how steady your scores are.';
  const how = spread < 0.6 ? 'Very steady' : spread < 1.1 ? 'Fairly steady' : 'Up and down';
  return `${how}: your last rounds vary by about ±${fmt(spread)} points.`;
}

function changeArrow(delta: number) {
  if (delta >= 0.05) return '↑';
  if (delta <= -0.05) return '↓';
  return '→';
}

function WeakSpot({ summary }: { summary: StatsSummary }) {
  const asked = summary.types.filter((t) => t.total >= 3);
  if (asked.length < 2) return null;
  const weakest = asked.reduce((a, b) => (b.accuracy < a.accuracy ? b : a));
  const strongest = asked.reduce((a, b) => (b.accuracy > a.accuracy ? b : a));
  if (weakest === strongest) return null;
  return (
    <Text style={styles.note}>
      Strongest at {TYPE_LABELS[strongest.type].toLowerCase()}. Next time, look harder for{' '}
      {TYPE_LABELS[weakest.type].toLowerCase()}.
    </Text>
  );
}

function Tile({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>
        {value}
        {suffix && <Text style={styles.tileSuffix}> {suffix}</Text>}
      </Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  loading: { marginTop: 80 },
  empty: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  emptyTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40, gap: 28 },
  hero: { gap: 6 },
  heroTitle: { color: colors.accent, fontSize: 28, fontWeight: '900' },
  heroDetail: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  disclaimer: { color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  tile: {
    flexGrow: 1,
    flexBasis: '40%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    gap: 4,
  },
  tileValue: { color: colors.text, fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  tileSuffix: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  tileLabel: { color: colors.textMuted, fontSize: 13 },
  section: { gap: 14 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  table: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 6 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 6 },
  tableHead: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  th: { flex: 1, color: colors.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  colName: { flex: 1.6, textAlign: 'left' },
  colTrend: { flex: 1.4 },
  levelName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  td: { color: colors.text, fontSize: 15, fontWeight: '600' },
  tdNum: { flex: 1, color: colors.text, fontSize: 15, textAlign: 'right', fontVariant: ['tabular-nums'] },
  tdMuted: { color: colors.textMuted, fontSize: 13, textAlign: 'right' },
  types: { gap: 14 },
  typeRow: { gap: 6 },
  typeHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  note: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  sessions: { backgroundColor: colors.surface, borderRadius: radius.md },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sessionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  sessionMain: { flex: 1, gap: 2 },
  sessionMeta: { color: colors.textMuted, fontSize: 13 },
  sessionScore: { color: colors.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  reset: { alignSelf: 'center', padding: 12 },
  resetText: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  resetConfirm: { color: colors.wrong, fontWeight: '700' },
});
