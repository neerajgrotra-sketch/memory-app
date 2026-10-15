import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AGE_BANDS } from '@/profile';
import { colors, radius } from '@/theme';
import type { AgeBand } from '@/types/profile';

interface AgeBandPickerProps {
  value: AgeBand | null;
  onChange: (band: AgeBand) => void;
}

/** Broad age bands as chips (44 pt tall). */
export function AgeBandPicker({ value, onChange }: AgeBandPickerProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {AGE_BANDS.map((band) => {
        const selected = band.value === value;
        return (
          <Pressable
            key={band.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(band.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{band.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  text: { color: colors.text, fontSize: 15, fontWeight: '600' },
  textSelected: { color: colors.accentText },
});
