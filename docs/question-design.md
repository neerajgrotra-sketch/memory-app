# What makes a good question

The rules every place's questions follow, agreed on 23 Oct 2026 from the owner's play-through of the Final Boss. The short version: **ask what was happening and who was there, not where things were.** Read this before adding a place, a thing or a kind of question.

## The examples they came from

At the airport, at Level 30:

| Liked | Didn't like |
| --- | --- |
| How many planes did you see? | Where did you see the information desk? |
| How many pilots did you see? | Can you remember where the helicopter was? |
| Which gate was the flight leaving from? | Where was the row of seats? |
| What was the flight number? | Were there more potted plants or more pilots? |
| What colour was the pilot's uniform? | Were there more flight attendants or more luggage trolleys? |
| | True or false? There were two pilots. (at Level 30) |

And two things that looked wrong in the picture: a coffee kiosk and an information desk with nobody at them.

## The rules

### 1. Ask what was happening, not where things were

A thing's state, or who is using it, makes a better question than its position.

| Instead of | Ask |
| --- | --- |
| Where was the helicopter? | Was the helicopter flying or on the ground? |
| Where did you see the information desk? | Was anyone at the information desk? |
| Where was the luggage trolley? | Was someone pushing the luggage trolley, or was it left on its own? |
| Where was the row of seats? | What had been left on the seats? |

### 2. Put people in the picture, and ask about them

Desks, kiosks, counters and vehicles are staffed or used: someone at the desk, someone serving at the kiosk, a rider on the snowmobile. Then ask about them: the colour of their uniform, what's on their head, what they're holding, what they're doing. People are what make a picture feel alive, and they give the best questions.

### 3. Give things the details that belong to the place

Gates and flight numbers at an airport, a bib number on a ski racer, a sum on the classroom board, a flag on a plane's tail. They make the place itself the puzzle.

- Use **made-up names**, never real brands or airlines.
- **Big enough to read on an iPhone SE.** A number on the helicopter was a few pixels tall and impossible to read: put numbers and flags only on big things (a sign, the parked plane's tail, a board).
- **Flags** are simple and clearly different from each other, never two that look alike (no French, Italian and Irish tricolours together).

### 4. Retire the dull kinds as the levels rise

| Kind | From now on |
| --- | --- |
| **Where was it?** (bands, left / right, next to a landmark) | Not asked. The one "where" left is a hiding animal ("Where was the fox hiding?"), which is a hunt, not a position. |
| **What was above / below the …?** | Not asked (it's position too). |
| **More X or more Y?**, **Which was there the most / just one of?** | Up to Level 10, then not asked. |
| **True or false** | Up to Level 12 (two levels after "more or fewer", so they don't both go at once). The Super Speed Round keeps it at every level: all its questions are Yes or No. |

### 4b. Only name parts of the picture a player can see

"Which of these was in the sky?" or "What was on the pond?" is fair: the sky and the pond are things you see. "Which of these was near the hills?" isn't: nobody can tell where "near the hills" starts. Bands like that (`VAGUE_BANDS` in generateQuestions.ts) are never named in a question.

### 5. Higher levels get harder through richer questions, not more inventory

More people and more details to hold ("What colour was the uniform of the person at the desk?"), closer options, two steps, and a shorter look. Not more "how many" and "where".

### 6. Every round has something happening in it

At least one "what was happening?" question in every round, and at least two from Level 20 and in every boss round (`storyMin`). A place without enough of them needs more drawn into it (rule 2).

### 7. No sums of two things

"How many more astronauts than craters?" and "How many astronauts and boulders altogether?" are silly: nobody counts unrelated things together. Pairing things from the same part of the picture (4.15.0) wasn't enough, so sums of two things aren't asked at all (4.16.0). Sharing ("If the 6 apples were split into 2 equal groups…") is about one thing, so it stays, from Level 29.

### 8. Nothing with writing or a flag is mirrored

Pictures flip some things left to right for variety. A number reads backwards and France's flag comes out red-white-blue the wrong way, so anything with a number, words or a flag has `noFlip`.

## Checklist for a new place or thing

- Who would be there? Draw them, doing something.
- What can change from picture to picture? (open or closed, flying or parked, someone there or not, what's on it, what they're holding.) Each is a question.
- What belongs only to this place? (numbers, signs, flags, a board.) Each is a question.
- Would a player who reached Level 30 enjoy the question? If it's a position or a "more X or Y", it doesn't belong.
