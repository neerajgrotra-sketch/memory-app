import { Asset } from 'expo-asset';

/**
 * Web: Web Audio, with every sound decoded up front. Playback starts instantly (so countdown ticks land on
 * the number), and it works on iPhone Safari, which only allows sound after a tap and blocks timed
 * playback through audio elements. The first tap or key press anywhere unlocks it.
 *
 * iPhones mute Web Audio when the ring/silent switch is on silent (audio elements still play), so the
 * page asks for the "playback" audio session where the browser supports it (iOS 17+). If Web Audio can't
 * run at all, sounds fall back to audio elements.
 */
type Ctx = AudioContext;
const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];

/** Fallback audio elements, one per sound, unlocked by the first tap so they can play later on a timer. */
const elements = new Map<number, HTMLAudioElement>();
let elementsUnlocked = false;

function elementFor(source: number): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  let el = elements.get(source);
  if (!el) {
    const asset = Asset.fromModule(source);
    el = new Audio(asset.localUri ?? asset.uri);
    el.preload = 'auto';
    elements.set(source, el);
  }
  return el;
}

function unlockElements() {
  if (elementsUnlocked) return;
  elementsUnlocked = true;
  // iPhone only lets an audio element play later if it was started once inside a tap: start each silently.
  elements.forEach((el) => {
    const volume = el.volume;
    el.muted = true;
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => {
        el.muted = false;
        el.volume = volume;
      });
  });
}

function playElement(source: number, volume: number) {
  const el = elementFor(source);
  if (!el) return;
  el.volume = volume;
  el.currentTime = 0;
  el.play().catch(() => {});
}
let ctx: Ctx | null = null;
const buffers = new Map<number, AudioBuffer>();
const loading = new Set<number>();

function context(): Ctx | null {
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  // Play like media rather than like a ringtone, so the silent switch doesn't mute the game on the web.
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  } catch {
    // Older browsers: the audio-element fallback covers them.
  }
  const unlock = () => {
    if (!ctx) return;
    ctx.resume().catch(() => {});
    // iPhone Safari also wants a sound started inside a tap: play a moment of silence.
    const silent = ctx.createBufferSource();
    silent.buffer = ctx.createBuffer(1, 1, 22050);
    silent.connect(ctx.destination);
    silent.start(0);
    unlockElements();
    if (ctx.state === 'running') UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, true));
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, true));
  return ctx;
}

/** The file's bytes; inlined data: URIs are decoded directly, so no network request is needed. */
async function bytesOf(uri: string): Promise<ArrayBuffer> {
  if (uri.startsWith('data:')) {
    const base64 = uri.slice(uri.indexOf(',') + 1);
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out.buffer;
  }
  return (await fetch(uri)).arrayBuffer();
}

export function preloadSound(source: number) {
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
  const c = context();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  const buffer = buffers.get(source);
  // Web Audio isn't available or hasn't started (or the sound isn't decoded yet): use the audio element.
  if (!c || c.state !== 'running' || !buffer) {
    if (!buffer) preloadSound(source);
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
