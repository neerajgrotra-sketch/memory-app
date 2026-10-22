# The Super Speed Round's and boss rounds' sounds, made from scratch (no samples): python3 scripts/sounds/make-speed-sounds.py assets/sounds
#   speed-intro    the lightning: a quick whoosh, a crackling zap as the bolt lands (0.15 s), thunder under it,
#                  then a bright stab as the title comes up (0.5 s)
#   speed-go       Start: a racing run of four notes up
#   speed-tick     the last two seconds of each question: a tight, urgent clock tick
#   speed-timeout  too slow: a short double buzzer
#   speed-prize    a prize won: a fanfare run up into a chord, with sparkles
#   boss-intro     a boss round: two heavy drum hits (the badge slams down on the second, 0.28 s), then a dark chord
#   boss-win       a boss beaten: a fanfare into a big held chord, a drum under it, sparkles
#   journey-travel the journey map: an airy whoosh and a rising glide as the marker moves to the next stop
#   journey-arrive a new place reached: bright bells running up, with a shimmer
#   stamp          the postcard's stamp landing: a soft thud and a paper slap
import numpy as np, subprocess, sys
SR = 44100
rng = np.random.default_rng(11)
out = sys.argv[1]


def write(name, x, peak_db=-3.0):
    # Peaks are set so each sounds about as loud as the game's other sounds (about -20 LUFS).
    # A few ms fade at each end so nothing clicks.
    f = int(SR * 0.004)
    x = x.copy(); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '96k', f'{out}/{name}.mp3'],
                   input=x.astype(np.float32).tobytes(), check=True)


def t_of(seconds):
    return np.arange(int(SR * seconds)) / SR


def lowpass(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / cutoff) ** 4), len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * ((f > lo) & (f < hi)), len(x))


def tone(freq, seconds, kind='saw', decay=0.25, attack=0.004):
    """A synth note: freq may be a number or an array (a sweep)."""
    t = t_of(seconds)
    f = np.broadcast_to(np.asarray(freq, float), t.shape)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == 'saw':
        # A soft saw: a handful of harmonics, so it's bright but never harsh on a phone speaker.
        w = sum(np.sin(k * ph) / k for k in range(1, 8))
    elif kind == 'square':
        w = sum(np.sin(k * ph) / k for k in range(1, 9, 2))
    else:
        w = np.sin(ph) + 0.2 * np.sin(2 * ph)
    env = np.minimum(t / attack, 1) * np.exp(-t / decay)
    # The last 30 ms fade to silence, so a note never stops with a click.
    tail = min(len(t), int(SR * 0.03)); env[-tail:] *= np.linspace(1, 0, tail) ** 2
    return w * env


def place(buf, x, at):
    i = int(SR * at); n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n]


NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)  # MIDI note to Hz

# --- speed-intro (1.4 s) -------------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 1.45))
# Whoosh: noise swept up through a band, swelling into the strike.
w = rng.standard_normal(int(SR * 0.18))
sweep = np.zeros_like(w)
for k, (lo, hi) in enumerate(np.linspace([300, 900], [2500, 7000], 6)):
    seg = slice(k * len(w) // 6, (k + 1) * len(w) // 6)
    sweep[seg] = bandpass(w, lo, hi)[seg]
place(buf, sweep * np.linspace(0.1, 1, len(w)) ** 2 * 0.5, 0.0)
# The zap: a falling electric saw with crackle (random gating), as the bolt springs in at 0.15 s.
zt = t_of(0.5)
zap = tone(2400 * np.exp(-zt * 9) + 180, 0.5, 'saw', decay=0.12)
# (Noise is filtered first and shaped after: shaping first, the filter would smear it across the whole clip.)
crackle = bandpass((rng.random(len(zt)) < 0.08) * rng.standard_normal(len(zt)), 2000, 9000) * np.exp(-zt / 0.05) * np.linspace(1, 0, len(zt)) ** 2
place(buf, zap * 0.7 + crackle * 1.6, 0.15)
# Thunder: a low rumble and crack under it.
th = rng.standard_normal(int(SR * 0.9))
tt = t_of(0.9)
rumble = lowpass(th, 160) * np.exp(-tt / 0.3) * np.linspace(1, 0, len(tt)) ** 0.5
place(buf, rumble * 3.0 + bandpass(th, 800, 3000) * np.exp(-tt / 0.03) * 0.8, 0.17)
# The stab: a bright major chord as the title rises (0.5 s), with an octave on top.
for n in (60, 64, 67, 72, 76):
    place(buf, tone(NOTE(n), 0.9, 'saw', decay=0.3) * 0.22, 0.5)
write('speed-intro', buf, -2)

# --- speed-go (0.5 s) ----------------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 0.5))
for i, n in enumerate((67, 71, 74, 79)):
    place(buf, tone(NOTE(n), 0.3 if i == 3 else 0.09, 'square', decay=0.12 if i == 3 else 0.05) * (1.2 if i == 3 else 0.8), i * 0.06)
write('speed-go', buf, -10)

# --- speed-tick (0.06 s) -------------------------------------------------------------------------------------------
tt = t_of(0.06)
click = np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / 0.008) + 0.5 * np.sin(2 * np.pi * 900 * tt) * np.exp(-tt / 0.012)
click += bandpass(rng.standard_normal(len(tt)), 3000, 8000) * np.exp(-tt / 0.002) * 0.6  # filtered, then shaped
write('speed-tick', click, -8)

# --- speed-timeout (0.45 s) ----------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 0.45))
for at in (0.0, 0.2):
    b = tone(NOTE(43), 0.17, 'square', decay=0.5) + tone(NOTE(43) * 1.06, 0.17, 'square', decay=0.5)  # a buzzy, slightly off pair
    b *= np.clip((0.17 - t_of(0.17)) / 0.03, 0, 1)  # held, then a 30 ms release
    # (Already soft: nine harmonics of a low note. A filter here would click at the ends.)
    place(buf, b, at)
write('speed-timeout', buf, -11)

# --- speed-prize (1.3 s) -------------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 1.3))
for i, n in enumerate((72, 76, 79, 84)):
    place(buf, tone(NOTE(n), 0.12, 'square', decay=0.07) * 0.7, i * 0.07)
for n in (72, 76, 79, 84, 88):
    place(buf, tone(NOTE(n), 1.0, 'saw', decay=0.38) * 0.2, 0.3)
# Sparkles: little high pings scattered over the chord.
for _ in range(14):
    f = rng.uniform(2600, 5200)
    place(buf, tone(f, 0.12, 'sine', decay=0.03) * rng.uniform(0.15, 0.35), rng.uniform(0.3, 1.05))
write('speed-prize', buf, -5)


def drum(seconds=0.6, f0=110, f1=45):
    """A big low drum: a falling sine with a click of noise on the hit."""
    t = t_of(seconds)
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    hit = bandpass(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.01) * 0.5
    env_tail = np.clip((seconds - t) / 0.05, 0, 1)
    return (body + hit) * env_tail


# --- boss-intro (1.7 s) --------------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 1.7))
place(buf, drum() * 1.0, 0.0)
place(buf, drum(0.8, 120, 40) * 1.3, 0.28)
# A cymbal swell into the second hit.
sw = t_of(0.3)
place(buf, bandpass(rng.standard_normal(len(sw)), 4000, 12000) * (sw / 0.3) ** 2 * 0.25, 0.0)
# The dark chord: A minor, low, swelling in slowly, with a held low A under it.
for n, a in ((45, 0.5), (57, 0.3), (60, 0.25), (64, 0.25), (69, 0.15)):
    note = tone(NOTE(n), 1.15, 'saw', decay=0.9, attack=0.12) * a
    place(buf, lowpass(np.pad(note, (0, 2000)), 1800)[:len(note)], 0.5)
write('boss-intro', buf, -3)

# --- boss-win (2.0 s) ----------------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 2.0))
for i, n in enumerate((67, 72, 76, 79)):
    place(buf, tone(NOTE(n), 0.14, 'square', decay=0.09) * 0.7, i * 0.09)
place(buf, drum(0.9, 100, 50) * 0.8, 0.36)
for n in (60, 64, 67, 72, 76, 79):
    place(buf, tone(NOTE(n), 1.5, 'saw', decay=0.6, attack=0.01) * 0.18, 0.36)
for _ in range(20):
    place(buf, tone(rng.uniform(2600, 5600), 0.12, 'sine', decay=0.03) * rng.uniform(0.15, 0.35), rng.uniform(0.4, 1.6))
write('boss-win', buf, -3)


def bell(f, seconds=0.9, a=1.0):
    """A small bell: a sine with two inharmonic partials, fading."""
    t = t_of(seconds)
    w = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.08)
    return w * np.minimum(t / 0.003, 1) * np.exp(-t / (seconds * 0.35)) * np.clip((seconds - t) / 0.03, 0, 1) * a


# --- journey-travel (1.0 s) ----------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 1.0))
n = rng.standard_normal(len(buf))
tt = t_of(1.0)
swell = np.sin(np.pi * np.clip(tt / 0.95, 0, 1)) ** 2
# Low air fading into high air: one smooth sweep (switching bands in steps clicked).
p = np.clip(tt / 0.95, 0, 1)
air = bandpass(n, 400, 1500) * (1 - p) + bandpass(n, 1800, 6000) * p
place(buf, air * swell * 0.6, 0.0)
glide = tone(NOTE(67) * 2 ** (np.clip(t_of(0.7) / 0.7, 0, 1) * 7 / 12), 0.7, 'sine', decay=0.5, attack=0.08) * 0.35
place(buf, glide, 0.15)
write('journey-travel', buf, -9)

# --- journey-arrive (1.4 s) ----------------------------------------------------------------------------------------
buf = np.zeros(int(SR * 1.4))
for i, nn in enumerate((76, 80, 83, 88)):
    place(buf, bell(NOTE(nn), 1.0, 0.8), i * 0.08)
for _ in range(16):
    place(buf, tone(rng.uniform(3000, 6000), 0.1, 'sine', decay=0.025) * rng.uniform(0.1, 0.25), rng.uniform(0.3, 1.1))
write('journey-arrive', buf, -5)

# --- stamp (0.35 s) ------------------------------------------------------------------------------------------------
st = t_of(0.35)
thud = np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-st * 30)) / SR) * np.exp(-st / 0.06)
slap = bandpass(rng.standard_normal(len(st)), 700, 3500) * np.exp(-st / 0.012) * 0.7
write('stamp', (thud + slap) * np.clip((0.35 - st) / 0.03, 0, 1), -6)
print('ok')
