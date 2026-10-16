import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { playSound, preloadSound } from './player';

/**
 * Sounds and vibration for the game's moments. To change a sound, replace its file in `assets/sounds/`
 * (same name); nothing else needs to change. See `assets/sounds/README.md`.
 */
export type Moment =
  | 'start'
  | 'tickSoft'
  | 'tick'
  | 'correct'
  | 'wrong'
  | 'levelUp'
  | 'highScore'
  | 'roundPerfect'
  | 'roundGood'
  | 'roundMiss';

const SOUNDS: Record<Moment, number> = {
  start: require('../../assets/sounds/start.mp3'),
  tickSoft: require('../../assets/sounds/tick-soft.mp3'),
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  tick: require('../../assets/sounds/tick.mp3'),
  levelUp: require('../../assets/sounds/level-up.mp3'),
  highScore: require('../../assets/sounds/high-score.mp3'),
  roundPerfect: require('../../assets/sounds/round-perfect.mp3'),
  roundGood: require('../../assets/sounds/round-good.mp3'),
  roundMiss: require('../../assets/sounds/round-miss.mp3'),
};

/** Kept quiet so they sit under the game, never over it. */
const VOLUME: Record<Moment, number> = {
  start: 0.55,
  // The same tick all the way down: quiet under the picture each second, then clearly louder for 4-3-2-1.
  tickSoft: 0.2,
  tick: 0.65,
  correct: 0.6,
  wrong: 0.5,
  levelUp: 0.75,
  highScore: 0.7,
  roundPerfect: 0.6,
  roundGood: 0.6,
  roundMiss: 0.35,
};

/** No vibration for the soft ticks: a buzz every second would be too much. */
const HAPTICS: Record<Moment, (() => Promise<void>) | null> = {
  start: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  tickSoft: null,
  correct: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  wrong: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  tick: () => Haptics.selectionAsync(),
  levelUp: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  highScore: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  roundPerfect: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  roundGood: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  roundMiss: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
};

const prefs = { sound: true, haptics: true };

/** Set from the profile (Profile → Sounds, Vibration). */
export function setFeedbackPrefs(next: { sound: boolean; haptics: boolean }) {
  prefs.sound = next.sound;
  prefs.haptics = next.haptics;
}

/** Plays a moment's sound and vibration, as the player's settings allow. Never throws. */
export function feedback(moment: Moment) {
  if (prefs.sound) {
    try {
      playSound(SOUNDS[moment], VOLUME[moment]);
    } catch {
      // No audio: the game carries on silently.
    }
  }
  const buzz = HAPTICS[moment];
  if (buzz && prefs.haptics && Platform.OS !== 'web') buzz().catch(() => {});
}

/** Loads the sounds before they're needed, so the first one isn't late. */
export function preloadFeedback() {
  try {
    (Object.keys(SOUNDS) as Moment[]).forEach((m) => preloadSound(SOUNDS[m], VOLUME[m]));
  } catch {
    // Loading again on first play is fine.
  }
}
