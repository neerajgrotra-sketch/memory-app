import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LEVEL_LABELS, LEVEL_ORDER } from '@/game/difficulty';
import { colors, levelColors } from '@/theme';
import type { RoundResult } from '@/types/stats';

const CHART_HEIGHT = 140;
const MAX_SCORE = 5;
const GRID_STEPS = [0, 1, 2, 3, 4, 5];

function formatWhen(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

/** "Level 4" for levelled rounds, otherwise the band ("Practice · Easy" and older rounds). */
const roundLabel = (r: RoundResult) =>
  r.ladder ? `Level ${r.ladder.level}` : r.mode === 'daily' ? 'Daily challenge' : r.mode === 'levels' ? `${LEVEL_LABELS[r.level]} · same picture again` : `Practice · ${LEVEL_LABELS[r.level]}`;

interface ScoreChartProps {
  /** Oldest first. */
  rounds: RoundResult[];
}

/** Score per round as bars coloured by level. Tap a bar to see its details. */
export function ScoreChart({ rounds }: ScoreChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const activeIndex = selected !== null && selected < rounds.length ? selected : rounds.length - 1;
  const active = rounds[activeIndex];
  const levelsShown = LEVEL_ORDER.filter((level) => rounds.some((r) => r.level === level));

  return (
    <View style={styles.wrap}>
      {active && (
        <Text style={styles.readout}>
          <Text style={styles.readoutScore}>
            {active.score}/{active.total}
          </Text>
          {`  ${roundLabel(active)} · ${formatWhen(active.playedAt)}`}
        </Text>
      )}

      <View style={styles.plot}>
        <View style={styles.axis}>
          {[...GRID_STEPS].reverse().map((step) => (
            <Text key={step} style={styles.axisLabel}>
              {step % 5 === 0 ? step : ''}
            </Text>
          ))}
        </View>

        <View style={styles.area}>
          {GRID_STEPS.map((step) => (
            <View
              key={step}
              style={[styles.gridLine, { bottom: (step / MAX_SCORE) * CHART_HEIGHT }, step === 0 && styles.baseline]}
            />
          ))}
          <View style={styles.bars}>
            {rounds.map((round, i) => {
              const isActive = i === activeIndex;
              return (
                <Pressable
                  key={round.id}
                  onPress={() => setSelected(i)}
                  style={styles.hit}
                  accessibilityRole="button"
                  accessibilityLabel={`${roundLabel(round)}, ${round.score} out of ${round.total}, ${formatWhen(round.playedAt)}`}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(3, (round.score / MAX_SCORE) * CHART_HEIGHT),
                        backgroundColor: levelColors[round.level],
                        opacity: isActive ? 1 : 0.75,
                      },
                      isActive && styles.barActive,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        {levelsShown.map((level) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: levelColors[level] }]} />
            <Text style={styles.legendText}>{LEVEL_LABELS[level]}</Text>
          </View>
        ))}
        <Text style={styles.legendHint}>Tap a bar for details</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  readout: { color: colors.textMuted, fontSize: 14 },
  readoutScore: { color: colors.text, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  plot: { flexDirection: 'row', gap: 8 },
  axis: { height: CHART_HEIGHT, justifyContent: 'space-between', marginVertical: -7 },
  axisLabel: { color: colors.textMuted, fontSize: 11, lineHeight: 14, fontVariant: ['tabular-nums'] },
  area: { flex: 1, height: CHART_HEIGHT },
  gridLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  baseline: { height: 1, backgroundColor: colors.textMuted },
  bars: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  hit: { flex: 1, height: '100%', justifyContent: 'flex-end', maxWidth: 28 },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barActive: { borderWidth: 2, borderBottomWidth: 0, borderColor: colors.text },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { color: colors.text, fontSize: 13 },
  legendHint: { color: colors.textMuted, fontSize: 12, marginLeft: 'auto' },
});
