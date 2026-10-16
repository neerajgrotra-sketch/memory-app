import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Sounds and vibration for the game's moments. To change a sound, replace its file in `assets/sounds/`
 * (same name); nothing else needs to change. See `assets/sounds/README.md`.
 */
export type Moment = 'correct' | 'wrong' | 'tick' | 'levelUp' | 'highScore';

const SOUNDS: Record<Moment, number> = {
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  tick: require('../../assets/sounds/tick.mp3'),
  levelUp: require('../../assets/sounds/level-up.mp3'),
  highScore: require('../../assets/sounds/high-score.mp3'),
};

/** Kept quiet so they sit under the game, never over it. */
const VOLUME: Record<Moment, number> = { correct: 0.6, wrong: 0.5, tick: 0.35, levelUp: 0.75, highScore: 0.7 };

const HAPTICS: Record<Moment, () => Promise<void>> = {
  correct: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  wrong: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  tick: () => Haptics.selectionAsync(),
  levelUp: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  highScore: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

const prefs = { sound: true, haptics: true };

/** Set from the profile (Profile → Sounds, Vibration). */
export function setFeedbackPrefs(next: { sound: boolean; haptics: boolean }) {
  prefs.sound = next.sound;
  prefs.haptics = next.haptics;
}

const players = new Map<Moment, AudioPlayer>();
let audioReady = false;

function playerFor(moment: Moment): AudioPlayer {
  let player = players.get(moment);
  if (!player) {
    player = createAudioPlayer(SOUNDS[moment]);
    player.volume = VOLUME[moment];
    players.set(moment, player);
  }
  return player;
}

/** Plays a moment's sound and vibration, as the player's settings allow. Never throws. */
export function feedback(moment: Moment) {
  if (prefs.sound) {
    try {
      if (!audioReady) {
        audioReady = true;
        // The phone's silent switch wins: a muted phone plays nothing.
        setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
      }
      const player = playerFor(moment);
      player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // No audio (e.g. a browser that blocks it): the game carries on silently.
    }
  }
  if (prefs.haptics && Platform.OS !== 'web') HAPTICS[moment]().catch(() => {});
}

/** Loads the players before they're needed, so the first chime isn't late. */
export function preloadFeedback() {
  try {
    (Object.keys(SOUNDS) as Moment[]).forEach(playerFor);
  } catch {
    // Loading again on first play is fine.
  }
}
