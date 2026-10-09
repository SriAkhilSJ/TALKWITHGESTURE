# Model

## What is used

A **feed-forward neural network** that classifies **Indian Sign Language alphabet gestures A–Z** from MediaPipe hand landmarks.

It is the ISL-Vision model, exported for the browser. We did **not** retrain it.

| Item | Value |
| --- | --- |
| Source project | [RecursiveByte/ISL-Vision](https://github.com/RecursiveByte/ISL-Vision) (MIT) |
| Original files | `tools/original-model/hand_landmark_dnn.keras`, `scaler.pkl` |
| Browser files | `public/models/isl-ffnn/*` |
| Framework (training) | TensorFlow / Keras 3 Sequential |
| Framework (runtime) | TensorFlow.js, with a pure-JS FFNN fallback |
| Input | 127 float features |
| Output | 26-way softmax, index 0 = A … 25 = Z |
| Hidden layers | 256 ReLU, 128 ReLU, 64 ReLU (Dropout 0.3 was training-only) |

## Dataset

ISL-Vision states that the model was trained on the **Indian Sign Language Hand Landmarks Dataset**:

https://www.kaggle.com/datasets/eraakash/indian-sign-language-hand-landmarks-dataset

That dataset is **not redistributed** in this repository. Check its Kaggle license before using the data yourself.

Training notebook cited by ISL-Vision:

https://colab.research.google.com/drive/1_xbdp57p-9eelgWQwOS5kMYQYJwwBHE7

## Preprocessing (must match training)

Copied from ISL-Vision `feature_extractor.py`:

1. If no hands → no vector, no prediction.
2. Pair each hand with its Left/Right label.
3. Sort labels alphabetically so **Left is always first**.
4. `features[0] = 1.0` if two hands else `0.0`.
5. Write 21 × (x, y, z) for hand 0 then hand 1.
6. Missing hand slots stay at `-1.0`.
7. Apply sklearn `StandardScaler`: `(x - mean) / scale` using `scaler.json`.

Feature width is **127**, not 126: the extra scalar is the two-hand flag.

## Accuracy

ISL-Vision reports **99%** on its landmark classification task. That figure is **inherited from the source project**. This repository has not re-measured accuracy on a held-out ISL dataset.

Synthetic golden fixtures in `tests/fixtures/golden.json` only prove that **browser math matches the exported NumPy forward pass**, not real-world sign accuracy.

## Limitations

- Alphabet only. It does not understand fluent ISL grammar, non-manual markers, or a large lexicon.
- Many public-service signs (HELP, TICKET, …) are **not** native classes of this model. The app maps shortcut letters / fingerspelled keywords onto those phrases and documents that mapping.
- Static landmarks per frame. Movement-based signs are not modelled.
- Webcam angle, lighting, and handedness mismatches will reduce confidence; the stability filter will refuse the frame rather than guess silently.
- Do not tell judges or users that this system “translates all Indian Sign Language”.
