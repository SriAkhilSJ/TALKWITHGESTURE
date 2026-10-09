import {
  FEATURE_SIZE,
  FEATURES_PER_HAND,
  LANDMARKS_PER_HAND,
  MISSING_VALUE,
} from '../config/constants';
import type { DetectedHand, Landmark } from './types';

/**
 * Convert MediaPipe hands into the 127-d vector used to train the
 * ISL-Vision FFNN.
 *
 * Layout (matches backend/utils/feature_extractor.py):
 *   [0]           1.0 if two hands else 0.0
 *   [1..63]       left hand 21×(x,y,z)  — filled with -1 if missing
 *   [64..126]     right hand 21×(x,y,z) — filled with -1 if missing
 *
 * Hands are sorted Left before Right so ordering is deterministic even
 * when a hand appears, disappears, or crosses the other.
 */
export function extractHandFeatures(
  hands: DetectedHand[] | null | undefined,
): Float32Array | null {
  if (!hands || hands.length === 0) return null;

  const sorted = sortHands(hands);
  const features = new Float32Array(FEATURE_SIZE);
  features.fill(MISSING_VALUE);
  features[0] = sorted.length >= 2 ? 1 : 0;

  let offset = 1;
  for (let handIdx = 0; handIdx < 2; handIdx += 1) {
    const hand = sorted[handIdx];
    if (hand && hand.landmarks && hand.landmarks.length > 0) {
      writeLandmarks(features, offset, hand.landmarks);
    }
    offset += FEATURES_PER_HAND;
  }

  return features;
}

export function sortHands(hands: DetectedHand[]): DetectedHand[] {
  const copy = hands.filter(Boolean).slice(0, 2);
  copy.sort((a, b) => a.label.localeCompare(b.label));
  return copy;
}

export function normalizeHandLabel(raw: unknown): 'Left' | 'Right' {
  const value = unwrapLabel(raw).toLowerCase();
  if (value.startsWith('r')) return 'Right';
  return 'Left';
}

export function parseMediaPipeHands(results: unknown): DetectedHand[] {
  if (!results || typeof results !== 'object') return [];
  const data = results as {
    multiHandLandmarks?: unknown;
    multiHandedness?: unknown;
  };
  const landmarksList = Array.isArray(data.multiHandLandmarks)
    ? data.multiHandLandmarks
    : [];
  const handednessList = Array.isArray(data.multiHandedness)
    ? data.multiHandedness
    : [];

  const hands: DetectedHand[] = [];
  for (let i = 0; i < landmarksList.length; i += 1) {
    const landmarks = toLandmarks(landmarksList[i]);
    if (!landmarks) continue;
    const handed = handednessList[i];
    hands.push({
      label: normalizeHandLabel(handed),
      score: unwrapScore(handed),
      landmarks,
    });
  }
  return hands;
}

function writeLandmarks(
  features: Float32Array,
  offset: number,
  landmarks: Landmark[],
): void {
  const count = Math.min(LANDMARKS_PER_HAND, landmarks.length);
  for (let i = 0; i < count; i += 1) {
    const lm = landmarks[i];
    const idx = offset + i * 3;
    features[idx] = finiteOrMissing(lm?.x);
    features[idx + 1] = finiteOrMissing(lm?.y);
    features[idx + 2] = finiteOrMissing(lm?.z);
  }
}

function finiteOrMissing(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : MISSING_VALUE;
}

function toLandmarks(value: unknown): Landmark[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  return value.map((item) => {
    const row = item as { x?: number; y?: number; z?: number };
    return {
      x: Number(row?.x ?? MISSING_VALUE),
      y: Number(row?.y ?? MISSING_VALUE),
      z: Number(row?.z ?? MISSING_VALUE),
    };
  });
}

function unwrapLabel(raw: unknown): string {
  if (!raw) return 'Left';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    const obj = raw as {
      label?: unknown;
      classification?: Array<{ label?: unknown }>;
    };
    if (typeof obj.label === 'string') return obj.label;
    const nested = obj.classification?.[0]?.label;
    if (typeof nested === 'string') return nested;
  }
  return 'Left';
}

function unwrapScore(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return 0;
  const obj = raw as {
    score?: unknown;
    classification?: Array<{ score?: unknown }>;
  };
  if (typeof obj.score === 'number') return obj.score;
  const nested = obj.classification?.[0]?.score;
  return typeof nested === 'number' ? nested : 0;
}
