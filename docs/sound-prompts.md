# Sound prompts for AI generation

Prompts for generating glance's sounds with an AI sound-effect tool (for example ElevenLabs Sound Effects or Stable Audio; check the tool's licence allows use in a commercial app). Each sound replaces the file of the same name in `assets/sounds/` with no code changes (see `assets/sounds/README.md`). The last six are new moments that need a line of code each to hook up.

## How to use them

1. **Start every prompt with the style line**, so all the sounds belong together:

   > Gentle, friendly mobile puzzle game sound, warm and modern, soft marimba, kalimba, felt piano and light bells, in C major, clean studio quality, no voice, no music bed, no reverb tail, starts instantly with no silence.

2. **Set the length** in the tool to the one listed (or as close as it allows).
3. **Make 3–4 versions of each** and pick by ear on a phone speaker, not headphones.
4. **Hand them back for finishing:** trim any silence at the start and end, match their loudness (about −20 LUFS, like today's), and convert to MP3. Then test them in the beta.

## The 19 sounds the game uses now

### Every round

| File | Length | Prompt (after the style line) |
| --- | --- | --- |
| `start.mp3` | 0.5 s | A quick, bright "let's go" pluck: two rising kalimba notes. |
| `tick.mp3` | 0.25 s | A soft, short wooden tick, like a quiet clock. Very subtle; it plays once a second during a countdown. |
| `correct.mp3` | 0.6 s | A happy "right answer" chime: two quick rising marimba notes with a small sparkle. |
| `wrong.mp3` | 0.5 s | A gentle "not quite" sound: two soft falling felt-piano notes. Kind, never harsh or buzzy. |

### Round results

| File | Length | Prompt |
| --- | --- | --- |
| `round-perfect.mp3` | 2.4 s | A small crowd applauding warmly with a light cheer, for a perfect round. Bright and joyful, fading out. |
| `round-good.mp3` | 0.7 s | A short, warm success chime: a three-note rising arpeggio on bells. |
| `round-miss.mp3` | 1.2 s | A kind, sympathetic "aww": two soft falling notes, the second sagging slightly. Encouraging, not sad. |
| `high-score.mp3` | 0.7 s | A sparkling "new record" flourish: a quick glittery run of bells upward. |
| `level-up.mp3` | 0.8 s | An uplifting "level up" sound: a fast rising arpeggio landing on a bright chord, with a soft whoosh. |

### Super Speed Round

| File | Length | Prompt |
| --- | --- | --- |
| `speed-intro.mp3` | 1.5 s | An exciting "speed round" intro: a quick whoosh, a crackling electric zap at 0.15 s, a soft thunder rumble, then a bright synth stab at 0.5 s. Energetic but friendly. |
| `speed-go.mp3` | 0.5 s | A racing "go!": four fast rising notes, upbeat and quick. |
| `speed-tick.mp3` | 0.1 s | A tight, urgent clock tick, crisp and short. Plays on the last two seconds of a timer. |
| `speed-timeout.mp3` | 0.5 s | A short, playful double buzzer for "too slow". Low but not harsh, more game show than alarm. |
| `speed-prize.mp3` | 1.3 s | A winning fanfare: a quick run upward into a bright held chord, with sparkles. |

### Boss rounds

| File | Length | Prompt |
| --- | --- | --- |
| `boss-intro.mp3` | 1.8 s | A dramatic "boss battle" intro: two heavy drum hits (the second at 0.28 s, as a badge slams down), then a dark, low minor chord swelling. Exciting, not scary, suitable for children. |
| `boss-win.mp3` | 2.0 s | A triumphant victory fanfare: a quick brass-like run into a big held major chord, a drum hit under it, sparkles on top. |

### Journey map

| File | Length | Prompt |
| --- | --- | --- |
| `journey-travel.mp3` | 1.0 s | An airy whoosh with a gentle rising glide, as a marker travels along a path on a map. Light and hopeful. |
| `journey-arrive.mp3` | 1.4 s | Arriving somewhere new: bright bells running upward with a soft shimmer. Wonder and discovery. |
| `stamp.mp3` | 0.4 s | A rubber stamp landing on a paper postcard: a soft thud and a paper slap. |

## Six new moments (need hooking up)

| File (suggested) | Length | Prompt |
| --- | --- | --- |
| `peek.mp3` | 0.4 s | A card flipping over with a soft "whoosh-flip", as a picture is shown again briefly. |
| `fifty.mp3` | 0.5 s | Two quick soft "poof" sounds, as two wrong answers disappear. |
| `streak.mp3` | 0.8 s | A warm, glowing "streak" sound: a soft rising chime with a gentle flame-like whoosh. |
| `daily-done.mp3` | 1.0 s | "Today's challenge complete": a cheerful three-note bell sting with a sparkle. |
| `ready.mp3` | 0.9 s | An encouraging "you're ready!": a friendly rising arpeggio landing softly, calm and confident. |
| `tap.mp3` | 0.08 s | A very soft, subtle button tap, barely there. For menus. |

## Optional later

- **Menu music:** a relaxed 60–90 second loop for menus only (calm, light, marimba and soft pads, no strong beat); never during a picture.
- **Place ambiences:** waves at the beach, birdsong in the park, a crackling campfire, a station announcement, each a quiet 20–30 second loop.
