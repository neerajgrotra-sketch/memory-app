import numpy as np, subprocess, sys
SR = 44100
rng = np.random.default_rng(7)
out = sys.argv[1]

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    w = np.exp(-0.5 * ((np.log(f + 1) - np.log((lo * hi) ** 0.5)) / (np.log(hi / lo) / 2.2)) ** 2)
    return np.fft.irfft(X * w, len(x))

def write(name, x, peak_db=-3.0):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    raw = x.astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '96k', f'{out}/{name}.mp3'], input=raw, check=True)

# Applause: a small crowd (14 people) clapping at their own pace, swelling in and fading out.
dur = 2.4
n = int(SR * dur)
x = np.zeros(n + SR)
t_env = lambda t: np.clip(t / 0.25, 0, 1) * np.clip((dur - t) / 1.1, 0, 1)
for person in range(14):
    rate = rng.uniform(3.6, 5.2)       # claps per second
    centre = rng.uniform(900, 2600)    # each pair of hands sounds a bit different
    body = rng.uniform(0.15, 0.4)
    t = rng.uniform(0, 0.25)
    while t < dur:
        if rng.random() < t_env(t) ** 0.7:
            L = int(SR * 0.03)
            burst = rng.standard_normal(L)
            env = np.exp(-np.arange(L) / (SR * rng.uniform(0.003, 0.006)))
            clap = bandpass(burst * env, centre * 0.6, centre * 1.8) + body * bandpass(burst * env, 250, 700)
            i = int(t * SR)
            x[i:i + L] += clap * rng.uniform(0.5, 1.0)
        t += 1 / rate * rng.uniform(0.85, 1.15)
x = x[:n]
# A little room around it.
ir = rng.standard_normal(int(SR * 0.18)) * np.exp(-np.arange(int(SR * 0.18)) / (SR * 0.05)) * 0.08
x = x + np.convolve(x, ir)[:n]
fade = np.ones(n); fade[-int(SR * 0.3):] = np.linspace(1, 0, int(SR * 0.3))
write('perfect', x * fade, -4)

# "Aww": two soft notes falling a major third, the second sagging slightly, like a kind shrug.
def note(f0, length, bend=0.0):
    t = np.arange(int(SR * length)) / SR
    f = f0 * 2 ** (-bend * np.clip(t / length, 0, 1) / 12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    env = np.minimum(t / 0.02, 1) * np.exp(-t / (length * 0.45))
    # Fade the last 80 ms to silence so the note never ends with a click.
    tail = int(SR * 0.08); env[-tail:] *= np.linspace(1, 0, tail) ** 2
    return tone * env
a = note(392.0, 0.35)          # G4
b = note(311.1, 0.8, bend=0.6) # E-flat 4, sagging
y = np.zeros(int(SR * 1.15)); y[:len(a)] += a; s = int(SR * 0.2); y[s:s + len(b)] += b
write('miss', y, -6)
print('ok')
