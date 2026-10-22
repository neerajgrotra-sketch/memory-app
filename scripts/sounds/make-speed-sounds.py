# The Super Speed Round's sounds, made from scratch (no samples): python3 scripts/sounds/make-speed-sounds.py assets/sounds
#   speed-intro    the lightning: a quick whoosh, a crackling zap as the bolt lands (0.15 s), thunder under it,
#                  then a bright stab as the title comes up (0.5 s)
#   speed-go       Start: a racing run of four notes up
#   speed-tick     the last two seconds of each question: a tight, urgent clock tick
#   speed-timeout  too slow: a short double buzzer
#   speed-prize    a prize won: a fanfare run up into a chord, with sparkles
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
print('ok')
