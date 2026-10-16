import { Asset } from 'expo-asset';

/**
 * Web sound, two ways:
 *
 * - **iPhone and iPad: audio elements.** iOS mutes Web Audio in many situations (the silent switch, some
 *   in-app browsers), but plays audio elements reliably once each has been started inside a tap. So every
 *   element is preloaded, and the first taps start each one silently to unlock it for later timed playback.
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

const elements = new Map<number, HTMLAudioElement>();
const unlocked = new Set<HTMLAudioElement>();

function elementFor(source: number): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  let el = elements.get(source);
  if (!el) {
    const asset = Asset.fromModule(source);
    el = new Audio(asset.localUri ?? asset.uri);
    el.preload = 'auto';
    el.load();
    elements.set(source, el);
  }
  return el;
}

/** Inside a tap: start each element silently once, so iOS lets it play later on a timer. */
function unlockElements() {
  elements.forEach((el) => {
    if (unlocked.has(el)) return;
    el.muted = true;
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
        unlocked.add(el);
      })
      .catch(() => {})
      .finally(() => {
        el.muted = false;
      });
  });
}

function playElement(source: number, volume: number) {
  const el = elementFor(source);
  if (!el) return;
  el.muted = false;
  // iOS ignores element volume (it's always full); other browsers honour it.
  el.volume = volume;
  try {
    el.currentTime = 0;
  } catch {
    // Not loaded enough to seek yet: it plays from the start anyway.
  }
  el.play().catch(() => {});
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
  elementFor(source);
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
