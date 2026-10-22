import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { BossBadge } from '@/components/BossBadge';
import { Button } from '@/components/Button';
import { SceneSlice, placePostcard } from '@/components/GameArt';
import { feedback } from '@/feedback';
import { isPlaceStop, type Stop } from '@/games/lookRemember/journey';
import { colors, radius } from '@/theme';

interface StopIntroProps {
  stop: Stop | null;
  /** Just arrived: "New place unlocked!", with the postcard's flip and stamp. */
  arrived: boolean;
  /** Your level and the best you've reached: what can be played from here. */
  level: number;
  best: number;
  /** Play a round in this place (a place you've reached). */
  onExplore: (recipeId: string) => void;
  /** Play a round at your level. */
  onPlay: () => void;
  onBoss: (level: number) => void;
  onClose: () => void;
}

/**
 * A stop on the journey: its postcard (flipping in, then stamped, on arrival), one line of the trip's story, what the
 * level brings, and the way in: Explore a place you've reached, or Play your level. A stop not reached yet keeps its
 * picture a surprise.
 */
export function StopIntro({ stop, arrived, level, best, onExplore, onPlay, onBoss, onClose }: StopIntroProps) {
  return (
    <Modal visible={!!stop} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
        {stop && <Card stop={stop} arrived={arrived} level={level} best={best} onExplore={onExplore} onPlay={onPlay} onBoss={onBoss} onClose={onClose} />}
      </Pressable>
    </Modal>
  );
}

function Card({ stop, arrived, level, best, onExplore, onPlay, onBoss, onClose }: Omit<StopIntroProps, 'stop'> & { stop: Stop }) {
  const reduceMotion = useReducedMotion();
  const reached = stop.level <= best;
  const animate = arrived && !reduceMotion;
  const flip = useSharedValue(animate ? 0 : 1);
  const stamp = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!arrived) return;
    // The stamp lands as the postcard settles.
    const t = setTimeout(() => feedback('stamp'), reduceMotion ? 0 : 450);
    if (!reduceMotion) {
      flip.value = withSpring(1, { damping: 12, stiffness: 120 });
      stamp.value = withDelay(400, withSequence(withTiming(1.15, { duration: 90 }), withTiming(1, { duration: 120 })));
    }
    return () => clearTimeout(t);
  }, [arrived, flip, reduceMotion, stamp]);
  const flipStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 800 }, { rotateY: `${(1 - flip.value) * 90}deg` }, { scale: 0.8 + 0.2 * flip.value }] }));
  const stampStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, stamp.value * 2), transform: [{ rotate: '-12deg' }, { scale: 2 - stamp.value }] }));

  const place = isPlaceStop(stop);
  const kicker = !reached
    ? `Level ${stop.level} · Still to come`
    : arrived && place
      ? 'New place unlocked!'
      : arrived
        ? `Level ${stop.level} · New challenge`
        : `Level ${stop.level}${place ? ' · A place on your trip' : ''}`;
  const bossOpen = stop.boss && stop.level <= best;
  return (
    <Pressable style={styles.card} onPress={() => {}} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.cardContent}>
        <Animated.View style={[styles.postcard, flipStyle]}>
          {reached ? (
            <SceneSlice art={placePostcard(stop.recipeId)} style={[styles.picture, !place && styles.pictureDim]} />
          ) : (
            <View style={[styles.picture, styles.mystery]}>
              <Text style={styles.mysteryMark}>?</Text>
              <Text style={styles.mysteryText}>Reach Level {stop.level} to find out</Text>
            </View>
          )}
          {reached && (
            <Animated.View style={[styles.stamp, stampStyle]}>
              <Text style={styles.stampSmall}>{place ? 'Greetings from' : 'Level'}</Text>
              <Text style={styles.stampBig} numberOfLines={2}>
                {place ? stop.title : String(stop.level)}
              </Text>
            </Animated.View>
          )}
          {stop.boss && (
            <View style={styles.badge}>
              <BossBadge level={stop.boss.level} state={bossOpen ? 'open' : 'locked'} size={40} />
            </View>
          )}
        </Animated.View>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{reached || place ? stop.title : `Level ${stop.level}`}</Text>
        <Text style={styles.story}>{reached ? stop.story : place ? 'A new place waits here. Keep climbing to see it.' : 'A new challenge waits here.'}</Text>
        {stop.news.length > 0 && (
          <View style={styles.news}>
            <Text style={styles.newsTitle}>{reached ? 'What this stop brings' : 'Coming up'}</Text>
            {stop.news.map((n) => (
              <Text key={n} style={styles.newsLine}>
                • {n}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.actions}>
        {reached && place && <Button label={`Explore ${stop.placeName}`} onPress={() => onExplore(stop.recipeId)} />}
        {reached && !place && <Button label={`Play Level ${level}`} onPress={onPlay} />}
        {bossOpen && <Button label={`Take on the ${stop.boss!.badge}`} variant="secondary" onPress={() => onBoss(stop.boss!.level)} />}
        <Button label={reached ? 'Back to the map' : 'Close'} variant="secondary" onPress={onClose} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  card: { maxHeight: '100%', width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  cardContent: { padding: 20, gap: 10, alignItems: 'stretch' },
  postcard: { padding: 8, backgroundColor: '#fbf7ee', borderRadius: 10, marginBottom: 6 },
  picture: { width: '100%', borderRadius: 4, aspectRatio: 1.5 },
  pictureDim: { opacity: 0.85 },
  mystery: { backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', gap: 6 },
  mysteryMark: { color: colors.textMuted, fontSize: 56, fontWeight: '900' },
  mysteryText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  stamp: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    minWidth: 92,
    maxWidth: 140,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#b3261e',
    borderRadius: 6,
    backgroundColor: 'rgba(251,247,238,0.92)',
    alignItems: 'center',
  },
  stampSmall: { color: '#b3261e', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  stampBig: { color: '#b3261e', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  badge: { position: 'absolute', left: 14, top: 14 },
  kicker: { color: colors.accent, fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  story: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  news: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md, padding: 12, gap: 6 },
  newsTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  newsLine: { color: colors.text, fontSize: 15, lineHeight: 21 },
  actions: { padding: 16, paddingTop: 8, gap: 10 },
});
