# ISL Counter

Offline-first Indian Sign Language communication assistant for **public-service counters**.

The camera is mounted at the desk. The citizen does not hold a phone. Both hands stay free. Gesture inference runs locally on the counter computer and recognized signs become large readable text and speech for staff.

> This is **not** a full Indian Sign Language translator. The bundled model recognizes **ISL alphabet gestures (A–Z)**. A documented, limited service vocabulary is built on top of those letters.

## Problem

Deaf and hard-of-hearing citizens are often asked to write, type, or hand a phone across a railway, police, post-office, or government counter. That fails when the person needs both hands to sign, when there is no network, or when staff cannot read the screen.

## Solution

**ISL Counter** is a counter-mounted web application:

1. Webcam sees the citizen.
2. MediaPipe Hands extracts up to two-hand landmarks in the browser.
3. A local FFNN classifies the ISL alphabet letter.
4. A stability filter accepts a letter only after consecutive, high-confidence frames.
5. Service mode maps shortcut letters to counter phrases (`H` → `I NEED HELP`).
6. Spell mode fingerspells words such as `HELP` / `TICKET` and expands them.
7. The sentence is shown in large high-contrast type and spoken with the browser’s local TTS.
8. Staff can reply by microphone or by typing; the reply is shown in large text.

After the first load, **core recognition does not need the internet**.

## Architecture

```text
Citizen
  → counter camera
  → MediaPipe Hands (local WASM)
  → 127-d landmark vector
  → StandardScaler (local JSON)
  → FFNN A–Z (local weights, TF.js or JS)
  → confidence + consecutive-frame filter
  → service vocabulary / sentence builder
  → text + Web Speech TTS
Staff
  → microphone STT (optional) or typed reply
  → large text for the citizen
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [OFFLINE.md](OFFLINE.md), [MODEL.md](MODEL.md), and [DEMO.md](DEMO.md).

## Supported vocabulary (MVP)

The classifier supports **A–Z**. Service phrases are triggered by a held shortcut letter (Service mode) or by fingerspelling the keyword (Spell mode):

| Shortcut | Sign | Phrase |
| --- | --- | --- |
| H | HELP | I NEED HELP |
| T | TICKET | I NEED A TICKET |
| P | POLICE | I NEED THE POLICE |
| O | HOSPITAL | I NEED A HOSPITAL |
| W | WATER | I NEED WATER |
| Y | YES | YES |
| N | NO | NO |
| K | THANK YOU | THANK YOU |
| R | WHERE | WHERE IS IT |
| M | MONEY | I NEED TO PAY |
| E | REPEAT | PLEASE REPEAT |
| S | STOP | PLEASE STOP |

## Setup

Node.js 20+ is enough. There is **no FastAPI server** for recognition.

```bash
npm install
npm test
npm run dev
```

Open the printed local URL (the dev server binds `0.0.0.0:5173`). Allow the camera.

Production build:

```bash
npm run build
npm run preview
```

Install the PWA from the browser if you want a standalone counter display, then disable the network and confirm recognition still runs. Details in [OFFLINE.md](OFFLINE.md).

## What was reused

Engineering base: [RecursiveByte/ISL-Vision](https://github.com/RecursiveByte/ISL-Vision) (MIT).

Kept:

- MediaPipe two-hand landmark idea
- 127-d feature layout (two-hand flag + 21×3×2)
- StandardScaler + FFNN alphabet classifier
- original `.keras` / `.pkl` files under `tools/original-model/` for attribution

Changed:

- Recognition no longer sends frames to `/api/predict`
- Inference is entirely in the browser
- Counter-mode UI, stability filter, service vocabulary, TTS/STT, PWA

## License

MIT. Third-party notices are in [NOTICE](NOTICE) and [LICENSE](LICENSE).
