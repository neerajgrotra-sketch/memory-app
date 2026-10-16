import { Asset } from 'expo-asset';

/**
 * Web: Web Audio, with every sound decoded up front. Playback starts instantly (so countdown ticks land on
 * the number), and it works on iPhone Safari, which only allows sound after a tap and blocks timed
 * playback through audio elements. The first tap or key press anywhere unlocks it.
 */
type Ctx = AudioContext;
let ctx: Ctx | null = null;
const buffers = new Map<number, AudioBuffer>();
const loading = new Set<number>();

function context(): Ctx | null {
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  const unlock = () => {
    if (!ctx) return;
    ctx.resume().catch(() => {});
    // iPhone Safari also wants a sound started inside a tap: play a moment of silence.
    const silent = ctx.createBufferSource();
    silent.buffer = ctx.createBuffer(1, 1, 22050);
    silent.connect(ctx.destination);
    silent.start(0);
    if (ctx.state === 'running') ['pointerdown', 'touchend', 'keydown'].forEach((e) => window.removeEventListener(e, unlock, true));
  };
  ['pointerdown', 'touchend', 'keydown'].forEach((e) => window.addEventListener(e, unlock, true));
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
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const buffer = buffers.get(source);
  if (!buffer) {
    preloadSound(source);
    return;
  }
  const node = c.createBufferSource();
  node.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = volume;
  node.connect(gain).connect(c.destination);
  node.start(0);
}
