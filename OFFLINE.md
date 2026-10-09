# Offline operation

Core gesture recognition is designed to keep working after the first successful load, with the network disabled.

## What is packaged locally

| Asset | Location |
| --- | --- |
| Application JS/CSS/HTML | Vite build |
| PWA manifest + service worker | `vite-plugin-pwa` |
| Alphabet FFNN weights | `public/models/isl-ffnn/weights.bin` |
| Weight layout | `public/models/isl-ffnn/manifest.json` |
| StandardScaler | `public/models/isl-ffnn/scaler.json` |
| MediaPipe Hands WASM/data | `public/mediapipe/hands/` (copied from npm on `postinstall`) |
| Vocabulary | `public/vocabulary.json` and `src/data/vocabulary.ts` |

There is no cloud vision API, no OpenAI/Gemini/Claude call, no Firebase/Supabase, and no remote `/api/predict`.

## How to verify

1. `npm run build && npm run preview`
2. Open the preview URL, allow the camera, wait until the header shows a model engine (`tfjs` or `javascript`)
3. Optionally install the PWA
4. Disable the network (browser DevTools → Offline, or unplug)
5. Reload
6. Start the camera — landmarks and letters should still appear

The header badge reads **Offline · local recognition** when `navigator.onLine` is false.

## What still needs a browser API

These are local device APIs, not cloud services:

- Camera (`getUserMedia`)
- Speech synthesis (`speechSynthesis`) when the OS has voices installed
- Speech recognition (`webkitSpeechRecognition`) when the browser provides it

If STT is missing, staff can type a reply. Recognition does not depend on STT.

## Service worker

Workbox precaches JS, CSS, HTML, JSON, BIN, WASM, and DATA files up to 20 MB so MediaPipe assets are included. Runtime caching also pins `/models/` and `/mediapipe/`.
