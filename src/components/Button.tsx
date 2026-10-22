import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { colors, radius } from '@/theme';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: 'primary' | 'secondary';
  /** A small drawn icon before the label (our own drawings: emoji differ by phone and can look broken). */
  icon?: ReactNode;
}

export function Button({ label, variant = 'primary', icon, ...rest }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 17, fontWeight: '700' },
  primaryLabel: { color: colors.accentText },
  secondaryLabel: { color: colors.text },
});
