import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/** Phones: one expo-audio player per sound, made once and rewound for each play. */
const players = new Map<number, AudioPlayer>();
let modeSet = false;

function playerFor(source: number, volume: number) {
  let player = players.get(source);
  if (!player) {
    player = createAudioPlayer(source);
    player.volume = volume;
    players.set(source, player);
  }
  return player;
}

export function preloadSound(source: number, volume: number) {
  playerFor(source, volume);
}

export function playSound(source: number, volume: number) {
  if (!modeSet) {
    modeSet = true;
    // The phone's silent switch wins: a muted phone plays nothing.
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
  }
  const player = playerFor(source, volume);
  player.seekTo(0).catch(() => {});
  player.play();
}
