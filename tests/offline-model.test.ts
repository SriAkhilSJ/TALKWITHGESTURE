import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('offline model packaging', () => {
  it('bundles the converted landmark model locally', () => {
    expect(existsSync('public/models/isl-ffnn/weights.bin')).toBe(true);
    expect(existsSync('public/models/isl-ffnn/manifest.json')).toBe(true);
    expect(existsSync('public/models/isl-ffnn/scaler.json')).toBe(true);
    const scaler = JSON.parse(
      readFileSync('public/models/isl-ffnn/scaler.json', 'utf8'),
    ) as { n_features: number };
    expect(scaler.n_features).toBe(127);
  });

  it('ships a PWA manifest', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html.includes('ISL Counter')).toBe(true);
  });
});
