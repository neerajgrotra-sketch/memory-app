import { useState, type ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors, radius } from '@/theme';

import type { SkillId } from './registry';

/**
 * Games we're planning, shown as rows on the Games tab in tester mode only, to see how the hub looks
 * with more games. They aren't games yet: a tap just says "coming soon". Real players never see them
 * (empty "coming soon" rows make an app feel unfinished; see docs/design-decisions.md).
 */
export interface PlannedGame {
  id: string;
  title: string;
  skill: SkillId;
  tagline: string;
  /** The row's thumbnail colour and its little picture (drawn in a 220 × 124 box, shown cropped square). */
  tint: string;
  art: () => ReactElement;
}

const card = (x: number, y: number, face: boolean, fill = '#ffffff') => (
  <G key={`${x}-${y}`}>
    <Rect x={x} y={y} width={34} height={42} rx={6} fill={face ? fill : '#1f6f6a'} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} />
  </G>
);

export const PLANNED_GAMES: PlannedGame[] = [
  {
    id: 'pairs',
    title: 'Pairs',
    skill: 'memory',
    tagline: 'See the cards, then find the matching pairs.',
    tint: '#2a9d8f',
    art: () => (
      <G>
        {[0, 1, 2, 3].map((i) => card(30 + i * 42, 16, i === 1 || i === 2))}
        {[0, 1, 2, 3].map((i) => card(30 + i * 42, 66, false))}
        <Circle cx={89} cy={37} r={10} fill="#e63946" />
        <Circle cx={131} cy={37} r={10} fill="#e63946" />
      </G>
    ),
  },
  {
    id: 'where-was-it',
    title: 'Where Was It?',
    skill: 'memory',
    tagline: 'Things appear and vanish. Tap where each one was.',
    tint: '#6d597a',
    art: () => (
      <G>
        {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => <Circle key={`${r}${c}`} cx={50 + c * 30} cy={22 + r * 27} r={4} fill="#ffffff" fillOpacity={0.35} />))}
        <Circle cx={80} cy={49} r={12} fill="#ffb703" />
        <Circle cx={170} cy={76} r={12} fill="#ffb703" fillOpacity={0.5} />
        <Path d="M140,90 l10,22 l4,-9 l9,-3 Z" fill="#ffffff" />
      </G>
    ),
  },
  {
    id: 'spot-the-change',
    title: 'Spot the Change',
    skill: 'attention',
    tagline: 'The picture changes a little. What’s different?',
    tint: '#1d70d6',
    art: () => (
      <G>
        <Rect x={18} y={18} width={84} height={88} rx={8} fill="#ffffff" fillOpacity={0.9} />
        <Rect x={118} y={18} width={84} height={88} rx={8} fill="#ffffff" fillOpacity={0.9} />
        <Circle cx={45} cy={50} r={12} fill="#ffd60a" />
        <Rect x={60} y={68} width={28} height={24} fill="#e63946" />
        <Circle cx={145} cy={50} r={12} fill="#ffd60a" />
        <Rect x={160} y={68} width={28} height={24} fill="#2b9348" />
        <Circle cx={174} cy={80} r={22} fill="none" stroke="#ffb703" strokeWidth={4} />
      </G>
    ),
  },
  {
    id: 'odd-one-out',
    title: 'Odd One Out',
    skill: 'attention',
    tagline: 'One of these isn’t like the others. Find it fast.',
    tint: '#e76f51',
    art: () => (
      <G>
        {[0, 1, 2].flatMap((r) =>
          [0, 1, 2, 3, 4].map((c) =>
            r === 1 && c === 3 ? (
              <Rect key={`${r}${c}`} x={36 + c * 34 - 11} y={28 + r * 34 - 11} width={22} height={22} rx={3} fill="#ffd60a" />
            ) : (
              <Circle key={`${r}${c}`} cx={36 + c * 34} cy={28 + r * 34} r={11} fill="#ffffff" fillOpacity={0.9} />
            ),
          ),
        )}
      </G>
    ),
  },
  {
    id: 'whats-next',
    title: 'What Comes Next?',
    skill: 'problem-solving',
    tagline: 'Spot the pattern and pick what comes next.',
    tint: '#588157',
    art: () => (
      <G>
        <Circle cx={40} cy={62} r={14} fill="#ffffff" />
        <Rect x={68} y={48} width={28} height={28} rx={4} fill="#ffffff" />
        <Circle cx={124} cy={62} r={14} fill="#ffffff" />
        <Rect x={150} y={44} width={44} height={36} rx={8} fill="none" stroke="#ffffff" strokeWidth={3} strokeDasharray="6 5" />
        <Path d="M166,56 q6,-6 12,0 q0,6 -6,8 v4 M172,74 v1" fill="none" stroke="#ffd60a" strokeWidth={4} strokeLinecap="round" />
      </G>
    ),
  },
  {
    id: 'quick-count',
    title: 'Quick Count',
    skill: 'speed',
    tagline: 'A flash of things. How many did you see?',
    tint: '#9d4edd',
    art: () => (
      <G>
        {[
          [40, 34], [70, 60], [56, 92], [100, 30], [120, 80], [150, 44], [130, 104],
        ].map(([x, y]) => (
          <Circle key={`${x}${y}`} cx={x} cy={y} r={10} fill="#ffffff" fillOpacity={0.9} />
        ))}
        <Circle cx={186} cy={92} r={20} fill="#ffd60a" />
        <Path d="M186,80 V92 L194,98" fill="none" stroke="#3c096c" strokeWidth={3.5} strokeLinecap="round" />
      </G>
    ),
  },
];

/** A planned game's row, the same shape as a real game's, marked "Coming soon"; a tap says so. */
export function PlannedGameRow({ game }: { game: PlannedGame }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${game.title}, coming soon`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.thumb, { backgroundColor: game.tint }]}>
          <Svg width="100%" height="100%" viewBox="0 0 220 124" preserveAspectRatio="xMidYMid meet">
            {game.art()}
          </Svg>
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {game.title}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {game.tagline}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Soon</Text>
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close">
          <View style={styles.sheet}>
            <Text style={styles.sheetKicker}>Coming soon</Text>
            <Text style={styles.sheetTitle}>{game.title}</Text>
            <Text style={styles.sheetText}>{game.tagline}</Text>
            <Text style={styles.sheetNote}>A planned game, shown in tester mode to preview the Games tab.</Text>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={({ pressed }) => [styles.ok, pressed && styles.pressed]}>
              <Text style={styles.okText}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    minHeight: 96,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  thumb: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden' },
  badge: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, minHeight: 32, justifyContent: 'center' },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  body: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13, flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 8 },
  sheetKicker: { color: colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  sheetText: { color: colors.text, fontSize: 16, lineHeight: 22 },
  sheetNote: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  ok: { marginTop: 8, backgroundColor: colors.accent, borderRadius: radius.pill, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  okText: { color: colors.accentText, fontSize: 16, fontWeight: '800' },
});
