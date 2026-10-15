import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgeBandPicker } from '@/components/AgeBandPicker';
import { EXTRA_SECONDS, initialOf, useProfile } from '@/profile';
import { RECIPES } from '@/scenes/recipes';
import { colors, radius } from '@/theme';
import { APP_VERSION } from '@/version';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * The player's profile. Built as sections so account and subscription settings can be added as new
 * sections later; today it only shows what works.
 */
export default function ProfileScreen() {
  const { profile, update, setAgeBand, clearDetails } = useProfile();
  // What's being typed; null when not editing, so the field always shows the saved name otherwise.
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? profile?.name ?? '';
  const [confirmClear, setConfirmClear] = useState(false);

  // Temporary testing filter: which settings are played (null = all).
  const filter = profile?.recipeFilter?.length ? profile.recipeFilter : null;
  const isOn = (id: string) => !filter || filter.includes(id);
  const onCount = filter ? filter.length : RECIPES.length;
  const toggleRecipe = (id: string) => {
    const current = filter ?? RECIPES.map((r) => r.id);
    const next = current.includes(id) ? current.filter((r) => r !== id) : [...current, id];
    if (!next.length) return;
    update({ recipeFilter: next.length === RECIPES.length ? null : next });
  };

  const saveName = () => {
    if (draft === null) return;
    const trimmed = draft.trim() || null;
    setDraft(null);
    if (trimmed !== (profile?.name ?? null)) update({ name: trimmed, asked: true });
  };

  const clear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearDetails();
    setConfirmClear(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialOf(profile) ?? '👤'}</Text>
          </View>
          <Text style={styles.heroName}>{profile?.name ?? 'Player'}</Text>
        </View>

        <Section title="Your details" footer="Your details stay on this phone and are only used for greetings and picture timing.">
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setDraft}
            onBlur={saveName}
            onSubmitEditing={saveName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={30}
            returnKeyType="done"
            accessibilityLabel="Your name"
          />
          <Text style={styles.label}>Age</Text>
          <AgeBandPicker value={profile?.ageBand ?? null} onChange={(band) => setAgeBand(band).then(() => update({ asked: true }))} />
        </Section>

        <Section title="Playing">
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowTitle}>More time to look</Text>
              <Text style={styles.rowDetail}>Show each picture for {EXTRA_SECONDS} extra seconds.</Text>
            </View>
            <Switch
              value={profile?.moreTime ?? false}
              onValueChange={(moreTime) => update({ moreTime })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.text}
              accessibilityLabel="More time to look"
            />
          </View>
        </Section>

        <Section
          title="Testing (temporary)"
          footer="Only the settings switched on are played, so you can focus on one while tuning it. At least one stays on."
        >
          {RECIPES.map((recipe) => {
            const on = isOn(recipe.id);
            return (
              <View key={recipe.id} style={styles.switchRow}>
                <Text style={[styles.rowTitle, styles.switchText]}>{recipe.title}</Text>
                <Switch
                  value={on}
                  disabled={on && onCount === 1}
                  onValueChange={() => toggleRecipe(recipe.id)}
                  trackColor={{ true: colors.accent, false: colors.border }}
                  thumbColor={colors.text}
                  accessibilityLabel={`Play ${recipe.title}`}
                />
              </View>
            );
          })}
          {filter && (
            <Pressable accessibilityRole="button" onPress={() => update({ recipeFilter: null })} style={styles.useAll}>
              <Text style={styles.useAllText}>Use all settings</Text>
            </Pressable>
          )}
        </Section>

        <Section title="About">
          <Text style={styles.rowDetail}>glance is a memory game, not a medical test. Its scores aren’t a measure of brain health.</Text>
          <Text style={styles.rowDetail}>Version {APP_VERSION}</Text>
        </Section>

        <Pressable accessibilityRole="button" onPress={clear} onBlur={() => setConfirmClear(false)} style={styles.clear}>
          <Text style={[styles.clearText, confirmClear && styles.clearConfirm]}>
            {confirmClear ? 'Tap again to clear your name and age' : 'Clear my details'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, footer, children }: { title: string; footer?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
      {footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40, gap: 24 },
  hero: { alignItems: 'center', gap: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accentText, fontSize: 34, fontWeight: '900' },
  heroName: { color: colors.text, fontSize: 22, fontWeight: '800' },
  section: { gap: 8 },
  sectionTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 10 },
  footer: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  switchText: { flex: 1, gap: 2 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowDetail: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  useAll: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  useAllText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  clear: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  clearText: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  clearConfirm: { color: colors.wrong, fontWeight: '700' },
});
