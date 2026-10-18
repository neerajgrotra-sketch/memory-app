import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AgeBandPicker } from '@/components/AgeBandPicker';
import { Button } from '@/components/Button';
import { useProfile } from '@/profile';
import { colors, radius } from '@/theme';
import type { AgeBand } from '@/types/profile';

/**
 * Asked once, after the first finished round (never before the first picture): a name for greetings
 * and an optional age band. Saving or skipping both mean it never shows again.
 */
export function ProfilePrompt() {
  const { profile, update, setAgeBand } = useProfile();
  const [name, setName] = useState('');
  const [band, setBand] = useState<AgeBand | null>(null);

  if (!profile || profile.asked) return null;

  const save = async () => {
    if (band) await setAgeBand(band);
    await update({ name: name.trim() || null, asked: true });
  };

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.card}>
      <Text style={styles.title}>Want to track your progress?</Text>
      <Text style={styles.text}>Both are optional and stay on this phone. You can change them any time in your profile.</Text>

      <Text style={styles.label}>What should we call you?</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={30}
        returnKeyType="done"
        accessibilityLabel="Your name"
      />

      <Text style={styles.label}>Your age</Text>
      <AgeBandPicker value={band} onChange={setBand} />
      {band === '55-plus' && <Text style={styles.note}>We’ll give you a few extra seconds to look at each picture.</Text>}

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Not now" variant="secondary" onPress={() => update({ asked: true })} />
        </View>
        <View style={styles.action}>
          <Button label="Save" onPress={save} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, padding: 16, gap: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  text: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 6 },
  input: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  note: { color: colors.accent, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  action: { flex: 1 },
});
