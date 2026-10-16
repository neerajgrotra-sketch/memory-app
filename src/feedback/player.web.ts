import { Asset } from 'expo-asset';

/**
 * Web sound, two ways:
 *
 * - **iPhone and iPad: audio elements.** iOS mutes Web Audio in many situations (the silent switch, some
 *   in-app browsers), but plays audio elements reliably once each has been started inside a tap. So a
 *   small pool of players is switched on by the first tap (with silence) and then plays every sound.
 * - **Everywhere else: Web Audio**, with every sound decoded up front, so playback starts instantly and
 *   countdown ticks land on the number. Audio elements are the fallback if Web Audio can't run.
 *
 * Browsers only allow sound after a tap, and iOS can pause audio again (after the screen locks, say), so
 * every tap checks that sound is still switched on.
 */

const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];

const isAppleTouch =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1));

// ---- Audio elements --------------------------------------------------------------------------------

/**
 * A small pool of players shared by every sound. iOS gives permission per player (once it has played
 * inside a tap it may play anything later, even on a timer), so a few players switched on by the first
 * tap can play every sound.
 */
const POOL_SIZE = 4;
/** A tenth of a second of silence (WAV), used to switch players on without a sound. */
const SILENCE = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

interface Player {
  el: HTMLAudioElement;
  /** Switched on by a tap. */
  allowed: boolean;
  /** Bumped by every real play, so a late "stop" from switching on never cuts a real sound off. */
  ticket: number;
}

const pool: Player[] = [];
let nextPlayer = 0;
const sources = new Map<number, string>();

function uriOf(source: number) {
  let uri = sources.get(source);
  if (!uri) {
    const asset = Asset.fromModule(source);
    uri = asset.localUri ?? asset.uri;
    sources.set(source, uri);
  }
  return uri;
}

function players(): Player[] {
  if (!pool.length && typeof Audio !== 'undefined') {
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = new Audio();
      el.preload = 'auto';
      pool.push({ el, allowed: false, ticket: 0 });
    }
  }
  return pool;
}

/** Inside a tap: play a moment of silence on each player not yet switched on. */
function unlockElements() {
  for (const p of players()) {
    if (p.allowed) continue;
    const ticket = p.ticket;
    p.el.src = SILENCE;
    p.el
      .play()
      .then(() => {
        p.allowed = true;
        // Only stop it if no real sound has started on this player since.
        if (p.ticket === ticket) p.el.pause();
      })
      .catch(() => {});
  }
}

function playElement(source: number, volume: number) {
  const list = players();
  if (!list.length) return;
  // Prefer a player that's switched on; take turns so overlapping sounds don't cut each other off.
  const order = Array.from({ length: list.length }, (_, i) => list[(nextPlayer + i) % list.length]);
  const p = order.find((x) => x.allowed) ?? order[0];
  nextPlayer = (list.indexOf(p) + 1) % list.length;
  p.ticket += 1;
  const uri = uriOf(source);
  if (p.el.src !== uri) p.el.src = uri;
  p.el.muted = false;
  // iOS ignores element volume (it's always full); other browsers honour it.
  p.el.volume = volume;
  try {
    p.el.currentTime = 0;
  } catch {
    // Not loaded enough to seek yet: it plays from the start anyway.
  }
  p.el
    .play()
    .then(() => (p.allowed = true))
    .catch(() => {});
}

// ---- Web Audio -----------------------------------------------------------------------------------

let ctx: AudioContext | null = null;
const buffers = new Map<number, AudioBuffer>();
const loading = new Set<number>();

function context(): AudioContext | null {
  if (isAppleTouch) return null;
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** The file's bytes; inlined data: URIs are decoded directly, so no network request is needed. */
async function bytesOf(uri: string): Promise<ArrayBuffer> {
  if (uri.startsWith('data:')) {
    const binary = atob(uri.slice(uri.indexOf(',') + 1));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out.buffer;
  }
  return (await fetch(uri)).arrayBuffer();
}

// ---- Switching sound on --------------------------------------------------------------------------

let listening = false;
function listenForTaps() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  const onTap = () => {
    unlockElements();
    const c = context();
    if (c && c.state !== 'running') {
      c.resume().catch(() => {});
      // Some browsers also want a sound started inside the tap: a moment of silence.
      const silent = c.createBufferSource();
      silent.buffer = c.createBuffer(1, 1, 22050);
      silent.connect(c.destination);
      silent.start(0);
    }
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, onTap, true));
}

// ---- Public --------------------------------------------------------------------------------------

export function preloadSound(source: number) {
  listenForTaps();
  players();
  uriOf(source);
  const c = context();
  if (!c || buffers.has(source) || loading.has(source)) return;
  loading.add(source);
  const asset = Asset.fromModule(source);
  bytesOf(asset.localUri ?? asset.uri)
    .then((data) => c.decodeAudioData(data))
    .then((buffer) => buffers.set(source, buffer))
    .catch(() => {})
    .finally(() => loading.delete(source));
}

export function playSound(source: number, volume: number) {
  listenForTaps();
  const c = context();
  const buffer = buffers.get(source);
  if (!c || c.state !== 'running' || !buffer) {
    if (c && c.state !== 'running') c.resume().catch(() => {});
    if (c && !buffer) preloadSound(source);
    playElement(source, volume);
    return;
  }
  const node = c.createBufferSource();
  node.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = volume;
  node.connect(gain).connect(c.destination);
  node.start(0);
}
