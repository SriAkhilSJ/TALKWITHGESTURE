# Demo

## What to say

> We built an offline-first ISL communication assistant for public-service counters. The camera is mounted at the counter, so the citizen can use both hands. Inference runs locally. Recognized signs become readable text and speech without a cloud API.

Do **not** say that the system translates all of Indian Sign Language.

## Live path (preferred)

1. `npm run dev` or `npm run preview`
2. Choose **Railway counter**
3. Start the camera
4. Confirm hand skeletons and the hand count
5. Service mode: hold an ISL letter
   - `H` → `I NEED HELP`
   - `T` → `I NEED A TICKET`
6. Press **Speak**
7. Optional: staff microphone / typed reply in large type
8. Open DevTools → Offline and show the badge switching to **Offline · local recognition**

If the alphabet model is unsure, confidence stays low and nothing is appended. That is intentional.

## Controlled railway demo

The yellow **Railway demo** button plays a labelled sequence. A banner states that this is **not live recognition**.

```text
HELP      → I NEED HELP
TICKET    → I NEED A TICKET
WHERE     → WHERE IS IT
THANK YOU → THANK YOU
```

Use this only when the camera or lighting is unreliable during judging. It does not replace live inference in normal mode.

## Counter mode cues

- “Public-service counter” header
- Citizen camera panel on the left
- Huge staff-facing sentence on the right
- Hand count, confidence, stability bar
- Offline badge
- Vocabulary chips with shortcut letters

The citizen stands in front of a fixed camera. They should not need to hold the laptop.
