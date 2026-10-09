import { describe, expect, it } from 'vitest';
import { StabilityFilter } from '../src/lib/stability';

const opts = {
  confidenceThreshold: 0.55,
  consecutiveNeeded: 4,
  cooldownMs: 1000,
};

describe('stability filter', () => {
  it('rejects low-confidence predictions', () => {
    const filter = new StabilityFilter(opts);
    const result = filter.push('H', 0.2, 1);
    expect(result.accepted).toBeNull();
    expect(result.stable).toBe(false);
    expect(result.progress).toBe(0);
  });

  it('rejects unstable flicker between letters', () => {
    const filter = new StabilityFilter(opts);
    filter.push('H', 0.9, 1);
    filter.push('H', 0.9, 2);
    const flipped = filter.push('T', 0.9, 3);
    expect(flipped.accepted).toBeNull();
    expect(flipped.progress).toBeCloseTo(1 / 4);
  });

  it('accepts a letter only after consecutive agreement', () => {
    const filter = new StabilityFilter(opts);
    let last = filter.push('H', 0.9, 1);
    last = filter.push('H', 0.9, 2);
    last = filter.push('H', 0.9, 3);
    expect(last.accepted).toBeNull();
    last = filter.push('H', 0.9, 4);
    expect(last.accepted).toBe('H');
    expect(last.stable).toBe(true);
  });

  it('does not accept the same gesture again before cooldown', () => {
    const filter = new StabilityFilter(opts);
    for (let i = 0; i < 4; i += 1) filter.push('H', 0.95, 10 + i);
    const again = filter.push('H', 0.95, 20);
    expect(again.accepted).toBeNull();
    filter.push(null, 0, 1500);
    let accepted: string | null = null;
    for (let i = 0; i < 4; i += 1) {
      accepted = filter.push('H', 0.95, 2000 + i).accepted;
    }
    expect(accepted).toBe('H');
  });

  it('treats a missing hand as no prediction', () => {
    const filter = new StabilityFilter(opts);
    filter.push('H', 0.9, 1);
    const none = filter.push(null, 0, 2);
    expect(none.current).toBeNull();
    expect(none.progress).toBe(0);
  });
});
