import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { playSound, preloadSound } from './player';

/**
 * Sounds and vibration for the game's moments. To change a sound, replace its file in `assets/sounds/`
 * (same name); nothing else needs to change. See `assets/sounds/README.md`.
 */
export type Moment =
  | 'start'
  | 'tick'
  | 'correct'
  | 'wrong'
  | 'levelUp'
  | 'highScore'
  | 'roundPerfect'
  | 'roundGood'
  | 'roundMiss'
  | 'speedIntro'
  | 'speedGo'
  | 'speedTick'
  | 'speedTimeout'
  | 'speedPrize'
  | 'bossIntro'
  | 'bossWin'
  | 'journeyTravel'
  | 'journeyArrive'
  | 'stamp';

const SOUNDS: Record<Moment, number> = {
  start: require('../../assets/sounds/start.mp3'),
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  tick: require('../../assets/sounds/tick.mp3'),
  levelUp: require('../../assets/sounds/level-up.mp3'),
  highScore: require('../../assets/sounds/high-score.mp3'),
  roundPerfect: require('../../assets/sounds/round-perfect.mp3'),
  roundGood: require('../../assets/sounds/round-good.mp3'),
  roundMiss: require('../../assets/sounds/round-miss.mp3'),
  speedIntro: require('../../assets/sounds/speed-intro.mp3'),
  speedGo: require('../../assets/sounds/speed-go.mp3'),
  speedTick: require('../../assets/sounds/speed-tick.mp3'),
  speedTimeout: require('../../assets/sounds/speed-timeout.mp3'),
  speedPrize: require('../../assets/sounds/speed-prize.mp3'),
  bossIntro: require('../../assets/sounds/boss-intro.mp3'),
  bossWin: require('../../assets/sounds/boss-win.mp3'),
  journeyTravel: require('../../assets/sounds/journey-travel.mp3'),
  journeyArrive: require('../../assets/sounds/journey-arrive.mp3'),
  stamp: require('../../assets/sounds/stamp.mp3'),
};

/** Kept quiet so they sit under the game, never over it. */
const VOLUME: Record<Moment, number> = {
  start: 0.55,
  // One tick for every number of the countdown, all the same.
  tick: 0.5,
  correct: 0.6,
  wrong: 0.5,
  levelUp: 0.75,
  highScore: 0.7,
  roundPerfect: 0.6,
  roundGood: 0.6,
  roundMiss: 0.35,
  speedIntro: 0.75,
  speedGo: 0.6,
  // Only on the last two seconds of a question, so a little louder than the countdown's tick.
  speedTick: 0.6,
  speedTimeout: 0.5,
  speedPrize: 0.7,
  bossIntro: 0.8,
  bossWin: 0.75,
  journeyTravel: 0.6,
  journeyArrive: 0.7,
  stamp: 0.7,
};

/** No vibration for the countdown ticks: a buzz every second would be too much. */
const HAPTICS: Record<Moment, (() => Promise<void>) | null> = {
  start: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  correct: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  wrong: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  tick: null,
  levelUp: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  highScore: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  roundPerfect: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  roundGood: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  roundMiss: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  speedIntro: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  speedGo: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  speedTick: null,
  speedTimeout: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  speedPrize: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  bossIntro: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  bossWin: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  journeyTravel: null,
  journeyArrive: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  stamp: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
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
