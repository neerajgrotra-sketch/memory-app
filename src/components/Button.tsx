import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, radius } from '@/theme';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, variant = 'primary', ...rest }: ButtonProps) {
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
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
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
  label: { fontSize: 17, fontWeight: '700' },
  primaryLabel: { color: colors.accentText },
  secondaryLabel: { color: colors.text },
});
