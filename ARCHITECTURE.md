# Architecture

## Current (this repository)

```text
React + TypeScript + Vite
        │
        ▼
Browser camera (MediaDevices)
        │
        ▼
MediaPipe Hands (vendored WASM, up to 2 hands)
        │
        ▼
Feature extractor  →  Float32[127]
        │
        ▼
sklearn StandardScaler params (scaler.json)
        │
        ▼
Local FFNN 127→256→128→64→26 softmax
   TensorFlow.js  or  pure JS fallback
        │
        ▼
Stability filter (confidence, consecutive frames, cooldown)
        │
        ▼
Service vocabulary / sentence builder
        │
   ┌────┴────┐
   ▼         ▼
 Text      Web Speech TTS
```

No Python process is required at runtime. FastAPI from ISL-Vision is **not** used for prediction.

## Source architecture (ISL-Vision)

```text
React webcam
   → MediaPipe overlay (CDN)
   → JPEG frame every 1s
   → FastAPI POST /api/predict
   → Python MediaPipe + scaler.pkl + Keras model
   → letter + word builder
```

That path cannot satisfy the offline public-service requirement, so it was replaced.

## Files that changed vs ISL-Vision

Must change (and did):

- Frontend prediction path — no `/api/predict`
- UI — counter mode, not a generic detector card
- Word builder — phrases, not only concatenated letters
- Asset loading — local MediaPipe + local model

Must remain conceptually unchanged:

- 127-d landmark vector
- Left-before-Right hand order
- Missing-hand fill value `-1`
- A–Z class mapping
- StandardScaler mean/scale
- Dense layer sizes and activations

## Runtime modules

| Module | Role |
| --- | --- |
| `src/lib/features.ts` | MediaPipe → 127-d vector |
| `src/lib/scaler.ts` | training-time normalization |
| `src/lib/ffnn.ts` | exact dense forward pass |
| `src/lib/inference.ts` | TF.js primary, JS fallback |
| `src/lib/stability.ts` | reject flicker |
| `src/lib/sentence.ts` | phrase assembly |
| `src/hooks/useHands.ts` | two-hand tracking |
| `src/hooks/useRecognition.ts` | local predict loop |

## Two-hand rules

- MediaPipe `maxNumHands = 2`
- Hands sorted `Left` then `Right`
- One-hand vectors pad the unused slot with `-1`
- Zero hands → no prediction, UI does not crash
- Hand count is shown on the camera panel

## Commands

```bash
npm install          # also vendors MediaPipe into public/mediapipe/hands
npm run dev          # http://0.0.0.0:5173
npm test             # vitest, including golden preprocessing/inference
npm run build
npm run preview      # http://0.0.0.0:4173  (PWA service worker active)
```
