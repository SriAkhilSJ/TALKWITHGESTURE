import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FEATURE_SIZE } from '../src/config/constants';
import { applyStandardScaler, type StandardScalerParams } from '../src/lib/scaler';

const scaler = JSON.parse(
  readFileSync('public/models/isl-ffnn/scaler.json', 'utf8'),
) as StandardScalerParams;
const golden = JSON.parse(
  readFileSync('tests/fixtures/golden.json', 'utf8'),
) as Record<
  string,
  { features: number[]; scaled: number[]; predicted_letter: string; confidence: number }
>;

describe('standard scaler', () => {
  it('matches the training scaler on golden fixtures', () => {
    for (const fixture of Object.values(golden)) {
      const scaled = applyStandardScaler(fixture.features, scaler);
      expect(scaled.length).toBe(FEATURE_SIZE);
      for (let i = 0; i < FEATURE_SIZE; i += 1) {
        const expected = fixture.scaled[i];
        const tol = Math.max(1e-3, Math.abs(expected) * 1e-5);
        expect(Math.abs(scaled[i] - expected)).toBeLessThanOrEqual(tol);
      }
    }
  });

  it('rejects the wrong feature size', () => {
    expect(() => applyStandardScaler([0, 1], scaler)).toThrow();
  });
});
