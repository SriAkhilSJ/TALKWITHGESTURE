import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyStandardScaler, type StandardScalerParams } from '../src/lib/scaler';
import {
  forwardFfnn,
  parseWeightBuffer,
  type WeightManifest,
} from '../src/lib/ffnn';

const golden = JSON.parse(
  readFileSync('tests/fixtures/golden.json', 'utf8'),
) as Record<
  string,
  {
    features: number[];
    predicted_letter: string;
    predicted_index: number;
    confidence: number;
  }
>;

const scaler = JSON.parse(
  readFileSync('public/models/isl-ffnn/scaler.json', 'utf8'),
) as StandardScalerParams;
const manifest = JSON.parse(
  readFileSync('public/models/isl-ffnn/manifest.json', 'utf8'),
) as WeightManifest;
const weights = readFileSync('public/models/isl-ffnn/weights.bin');
const net = parseWeightBuffer(weights.buffer.slice(
  weights.byteOffset,
  weights.byteOffset + weights.byteLength,
), manifest);

describe('local FFNN inference', () => {
  it('matches numpy golden predictions', () => {
    for (const [name, fixture] of Object.entries(golden)) {
      const scaled = applyStandardScaler(fixture.features, scaler);
      const pred = forwardFfnn(scaled, net);
      expect(pred.letter, name).toBe(fixture.predicted_letter);
      expect(pred.index, name).toBe(fixture.predicted_index);
      expect(pred.confidence, name).toBeCloseTo(fixture.confidence, 5);
      expect(pred.probabilities.length).toBe(26);
    }
  });
});
