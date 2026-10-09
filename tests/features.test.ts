import { describe, expect, it } from 'vitest';
import { FEATURE_SIZE, MISSING_VALUE } from '../src/config/constants';
import {
  extractHandFeatures,
  normalizeHandLabel,
  parseMediaPipeHands,
  sortHands,
} from '../src/lib/features';
import type { DetectedHand } from '../src/lib/types';

function fakeHand(label: 'Left' | 'Right', x = 0.2): DetectedHand {
  return {
    label,
    score: 0.9,
    landmarks: Array.from({ length: 21 }, (_, i) => ({
      x: x + i * 0.01,
      y: 0.4 + i * 0.005,
      z: -0.02,
    })),
  };
}

describe('feature extraction', () => {
  it('returns null when no hands are present', () => {
    expect(extractHandFeatures([])).toBeNull();
    expect(extractHandFeatures(null)).toBeNull();
    expect(extractHandFeatures(undefined)).toBeNull();
  });

  it('builds a 127-d vector for one hand and pads the unused second slot with -1', () => {
    const features = extractHandFeatures([fakeHand('Right', 0.7)]);
    expect(features).not.toBeNull();
    expect(features!.length).toBe(FEATURE_SIZE);
    expect(features![0]).toBe(0);
    // ISL-Vision places the only detected hand in slot 0 even if it is Right
    expect(features![1]).toBeCloseTo(0.7);
    // Second-hand slot remains missing
    expect(features![64]).toBe(MISSING_VALUE);
    expect(features![126]).toBe(MISSING_VALUE);
  });

  it('sets the two-hand flag and orders Left before Right', () => {
    const features = extractHandFeatures([fakeHand('Right', 0.7), fakeHand('Left', 0.2)]);
    expect(features![0]).toBe(1);
    expect(features![1]).toBeCloseTo(0.2);
    expect(features![64]).toBeCloseTo(0.7);
  });

  it('never throws when a hand disappears', () => {
    const two = extractHandFeatures([fakeHand('Left'), fakeHand('Right')]);
    const one = extractHandFeatures([fakeHand('Left')]);
    const none = extractHandFeatures([]);
    expect(two?.length).toBe(FEATURE_SIZE);
    expect(one?.length).toBe(FEATURE_SIZE);
    expect(none).toBeNull();
  });

  it('sorts hands deterministically', () => {
    const sorted = sortHands([fakeHand('Right'), fakeHand('Left')]);
    expect(sorted.map((h) => h.label)).toEqual(['Left', 'Right']);
  });

  it('normalizes MediaPipe handedness from both JS shapes', () => {
    expect(normalizeHandLabel('Right')).toBe('Right');
    expect(normalizeHandLabel({ label: 'Left' })).toBe('Left');
    expect(normalizeHandLabel({ classification: [{ label: 'Right' }] })).toBe('Right');
  });

  it('parses MediaPipe results without crashing on odd payloads', () => {
    expect(parseMediaPipeHands(null)).toEqual([]);
    expect(parseMediaPipeHands({})).toEqual([]);
    const parsed = parseMediaPipeHands({
      multiHandLandmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
      multiHandedness: [{ label: 'Left', score: 0.8 }],
    });
    expect(parsed).toHaveLength(1);
    expect(parsed[0].label).toBe('Left');
  });
});
