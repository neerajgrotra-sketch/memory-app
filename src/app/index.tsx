import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DIFFICULTY_OPTIONS } from '@/game/difficulty';
import { colors, radius } from '@/theme';
import { APP_VERSION } from '@/version';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>glance</Text>
        <Text style={styles.tagline}>
          Every picture is new. Study it, then answer{'\n'}5 questions from memory.
        </Text>
      </View>

      <View style={styles.list}>
        {DIFFICULTY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/play', params: { difficulty: option.value } })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Text style={styles.cardTitle}>{option.label}</Text>
            <Text style={styles.cardDescription}>{option.description}</Text>
          </Pressable>
        ))}
      </View>

      <Button label="Your progress" variant="secondary" onPress={() => router.push('/stats')} />

      <Text style={styles.version}>Version {APP_VERSION}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 32 },
  hero: { gap: 12 },
  title: { color: colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: -1 },
  tagline: { color: colors.textMuted, fontSize: 17, lineHeight: 24 },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 4,
  },
  cardPressed: { backgroundColor: colors.surfaceRaised, transform: [{ scale: 0.99 }] },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cardDescription: { color: colors.textMuted, fontSize: 14 },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: -16 },
});
