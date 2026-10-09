export interface StabilityOptions {
  confidenceThreshold: number;
  consecutiveNeeded: number;
  cooldownMs: number;
}

export interface StabilityResult {
  current: string | null;
  confidence: number;
  stable: boolean;
  accepted: string | null;
  progress: number;
}

/**
 * Reject one-frame flicker.
 *
 * A letter is accepted only when:
 *  - confidence stays above the threshold
 *  - the same letter is seen for `consecutiveNeeded` frames
 *  - a cooldown has elapsed since the last accepted sign
 */
export class StabilityFilter {
  private buffer: string[] = [];
  private lastAcceptedAt = Number.NEGATIVE_INFINITY;

  constructor(private readonly opts: StabilityOptions) {}

  reset(): void {
    this.buffer = [];
    this.lastAcceptedAt = Number.NEGATIVE_INFINITY;
  }

  push(
    letter: string | null,
    confidence: number,
    now = Date.now(),
  ): StabilityResult {
    if (!letter || confidence < this.opts.confidenceThreshold) {
      this.buffer = [];
      return {
        current: letter,
        confidence,
        stable: false,
        accepted: null,
        progress: 0,
      };
    }

    if (this.buffer.length > 0 && this.buffer[this.buffer.length - 1] !== letter) {
      this.buffer = [];
    }
    this.buffer.push(letter);

    const progress = Math.min(1, this.buffer.length / this.opts.consecutiveNeeded);
    const stable = this.buffer.length >= this.opts.consecutiveNeeded;
    const cooled = now - this.lastAcceptedAt >= this.opts.cooldownMs;

    let accepted: string | null = null;
    if (stable && cooled) {
      accepted = letter;
      this.lastAcceptedAt = now;
      this.buffer = [];
    }

    return {
      current: letter,
      confidence,
      stable,
      accepted,
      progress,
    };
  }
}
