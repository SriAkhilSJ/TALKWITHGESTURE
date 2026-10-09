export const FEATURE_SIZE = 127;
export const LANDMARKS_PER_HAND = 21;
export const COORDS_PER_LANDMARK = 3;
export const FEATURES_PER_HAND = LANDMARKS_PER_HAND * COORDS_PER_LANDMARK;
export const MISSING_VALUE = -1;
export const CLASS_COUNT = 26;
export const CLASS_TO_CHAR: string[] = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

export const MODEL_PATHS = {
  weights: '/models/isl-ffnn/weights.bin',
  manifest: '/models/isl-ffnn/manifest.json',
  scaler: '/models/isl-ffnn/scaler.json',
} as const;

export const MEDIAPIPE_ASSET_BASE = '/mediapipe/hands';

export const MEDIAPIPE_OPTIONS = {
  maxNumHands: 2,
  modelComplexity: 1 as 0 | 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

export const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
};

export const STABILITY = {
  confidenceThreshold: 0.55,
  consecutiveNeeded: 6,
  cooldownMs: 1600,
};

export const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
  [0, 17],
];

export const LANDMARK_COLORS = {
  wrist: '#FF4D4D',
  thumb: '#34D399',
  index: '#60A5FA',
  middle: '#F5C518',
  ring: '#E879F9',
  pinky: '#22D3EE',
};

export type CounterLocation = 'railway' | 'police' | 'post' | 'government';

export const LOCATIONS: Array<{ id: CounterLocation; label: string }> = [
  { id: 'railway', label: 'Railway counter' },
  { id: 'police', label: 'Police counter' },
  { id: 'post', label: 'Post office' },
  { id: 'government', label: 'Government counter' },
];
