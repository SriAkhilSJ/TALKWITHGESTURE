declare module '@mediapipe/hands' {
  export interface HandsOptions {
    maxNumHands?: number;
    modelComplexity?: 0 | 1;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class Hands {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: HandsOptions): void;
    onResults(callback: (results: unknown) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
    initialize(): Promise<void>;
    close(): void;
  }
}
