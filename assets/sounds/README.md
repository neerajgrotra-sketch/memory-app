# Sounds

Each file is one moment in the game. **To change a sound, replace the file with one of the same name** (MP3, short, with no silence at the start). No code changes are needed; volumes are set in `src/feedback/index.ts`.

| File | When it plays | Source |
| --- | --- | --- |
| `correct.mp3` | A right answer | uisfx "studio" `success` |
| `wrong.mp3` | A wrong answer | uisfx "studio" `error` |
| `tick.mp3` | Each of the last 3 seconds of looking | uisfx "studio" `progress-step` |
| `level-up.mp3` | The level-up screen, as the ring spins | uisfx "studio" `level-up` |
| `high-score.mp3` | A result with a new high score | uisfx "studio" `bonus` |

The current sounds come from [uisfx](https://github.com/romainsimon/uisfx) 0.4.0 (MIT licence, see `LICENSE-uisfx.txt`). They're a good free starting point; a paid sound pack can replace them file by file.

Tips for replacements: keep answer sounds under about 0.6 s (the quiz moves on quickly), the tick very short and quiet, and the level-up about 0.7–1 s so it lands with the ring's spin.
