import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Phones: a couple of expo-audio players per sound, made once, so a sound starts the moment it's asked for.
 * That matters most for the countdown, whose tick has to land on each number:
 *
 * - **Files on the phone first** (`downloadFirst`). In Expo Go the sounds otherwise stream from the dev server
 *   (through the tunnel) every time, which makes each tick late by a different amount.
 * - **The audio session stays on** (`keepAudioSessionActive`). iOS otherwise switches it off after every sound
 *   and has to switch it back on for the next one, which delays it.
 * - **Rewound when it finishes, not when it's next played.** Rewinding takes a moment, so a player is ready
 *   at the start before it's needed. Two players take turns, so a sound can start while the other still plays.
 */
const VOICES = 2;

interface Voice {
  player: AudioPlayer;
  /** At the start, ready to play at once. */
  ready: boolean;
}

const sounds = new Map<number, { voices: Voice[]; next: number }>();
let modeSet = false;

function setMode() {
  if (modeSet) return;
  modeSet = true;
  // The phone's silent switch wins: a muted phone plays nothing.
  setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
}

function voicesFor(source: number, volume: number) {
  let sound = sounds.get(source);
  if (!sound) {
    const voices = Array.from({ length: VOICES }, () => {
      const player = createAudioPlayer(source, { downloadFirst: true, keepAudioSessionActive: true });
      player.volume = volume;
      const voice: Voice = { player, ready: true };
      player.addListener('playbackStatusUpdate', (status) => {
        if (!status.didJustFinish) return;
        player
          .seekTo(0)
          .then(() => (voice.ready = true))
          .catch(() => {});
      });
      return voice;
    });
    sound = { voices, next: 0 };
    sounds.set(source, sound);
  }
  return sound;
}

export function preloadSound(source: number, volume: number) {
  setMode();
  voicesFor(source, volume);
}

export function playSound(source: number, volume: number) {
  setMode();
  const sound = voicesFor(source, volume);
  const { voices } = sound;
  // A player that's rewound and waiting, taking turns; if both are busy, the next one starts again.
  const order = voices.map((_, i) => voices[(sound.next + i) % voices.length]);
  const voice = order.find((v) => v.ready) ?? order[0];
  sound.next = (voices.indexOf(voice) + 1) % voices.length;
  if (voice.ready) {
    voice.ready = false;
    voice.player.play();
    return;
  }
  voice.player
    .seekTo(0)
    .then(() => voice.player.play())
    .catch(() => {});
}
