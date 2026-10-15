import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import type { RoundResult } from '@/types/stats';

const CHART_HEIGHT = 120;

/** Your level after each levelled round (oldest first), as steps. */
export function LevelChart({ rounds }: { rounds: RoundResult[] }) {
  const levels = rounds.flatMap((r) => (r.ladder ? [r.ladder.after.level] : []));
  if (levels.length < 2) return <Text style={styles.empty}>Play a few rounds to see your level climb.</Text>;
  const top = Math.max(5, ...levels);
  // Starts a little below your lowest level, so changes show at high levels too.
  const bottom = Math.max(0, Math.min(...levels) - 3);
  const span = top - bottom;
  return (
    <View style={styles.block} accessible accessibilityLabel={`Your level over your last ${levels.length} rounds: from ${levels[0]} to ${levels.at(-1)}.`}>
      <Text style={styles.caption}>Your level after each round</Text>
      <View style={styles.wrap}>
        <View style={styles.axis}>
          <Text style={styles.axisLabel}>{top}</Text>
        </View>
        <View style={styles.area}>
          {levels.map((level, i) => (
            <View key={i} style={styles.col}>
              <View style={[styles.bar, { height: ((level - bottom) / span) * CHART_HEIGHT }, i === levels.length - 1 && styles.barNow]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  caption: { color: colors.textMuted, fontSize: 13 },
  wrap: { flexDirection: 'row', gap: 8 },
  axis: { height: CHART_HEIGHT, justifyContent: 'space-between' },
  axisLabel: { color: colors.textMuted, fontSize: 11, fontVariant: ['tabular-nums'] },
  area: { flex: 1, height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderBottomColor: colors.textMuted },
  col: { flex: 1, maxWidth: 24, justifyContent: 'flex-end', height: '100%' },
  bar: { backgroundColor: colors.surfaceRaised, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderTopWidth: 3, borderTopColor: colors.accent },
  barNow: { backgroundColor: colors.accent },
  empty: { color: colors.textMuted, fontSize: 14 },
});
