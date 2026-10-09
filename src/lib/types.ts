export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedHand {
  label: 'Left' | 'Right';
  score: number;
  landmarks: Landmark[];
}

export interface Prediction {
  letter: string;
  index: number;
  confidence: number;
  probabilities: number[];
}

export interface RecognitionFrame {
  letter: string | null;
  confidence: number;
  handCount: number;
  stable: boolean;
  acceptedLetter: string | null;
}

export type InferenceEngine = 'tfjs' | 'javascript';

export type InputMode = 'service' | 'spell';
