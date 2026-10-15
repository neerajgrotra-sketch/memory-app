import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme';

export function QuitButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Quit" onPress={onPress} hitSlop={12} style={styles.button}>
      <Text style={styles.text}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
