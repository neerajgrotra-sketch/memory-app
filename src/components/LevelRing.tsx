import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { MAX_LEVEL, ROUNDS_TO_LEVEL_UP, type LadderState } from '@/games/lookRemember/ladder';
import { colors } from '@/theme';

interface LevelRingProps {
  ladder: LadderState;
  size?: number;
}

/**
 * Your level in the middle, and a ring split into one segment per good round needed to level up,
 * filled for the good rounds you already have.
 */
export function LevelRing({ ladder, size = 76 }: LevelRingProps) {
  const stroke = Math.max(5, size * 0.09);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segments = ROUNDS_TO_LEVEL_UP;
  const gap = c * 0.035;
  const seg = c / segments - gap;
  const filled = ladder.level >= MAX_LEVEL ? segments : ladder.progress;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`Level ${ladder.level}. ${filled} of ${segments} good rounds towards the next level.`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {Array.from({ length: segments }, (_, i) => (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={i < filled ? colors.accent : colors.surfaceRaised}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${seg} ${c - seg}`}
            // Start at the top, one segment after another clockwise.
            strokeDashoffset={-(i * (seg + gap)) + c / 4 - gap / 2}
          />
        ))}
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.caption, { fontSize: size * 0.13 }]}>LEVEL</Text>
        <Text style={[styles.level, { fontSize: size * 0.36 }]}>{ladder.level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  caption: { color: colors.textMuted, fontWeight: '800', letterSpacing: 1, marginBottom: -2 },
  level: { color: colors.text, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
