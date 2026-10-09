import { useEffect, useRef, useState } from 'react';
import { STABILITY } from '../config/constants';
import { extractHandFeatures } from '../lib/features';
import { loadLocalModel, type LocalModel } from '../lib/inference';
import { StabilityFilter } from '../lib/stability';
import type { DetectedHand, InferenceEngine } from '../lib/types';

export interface RecognitionState {
  loading: boolean;
  error: string | null;
  engine: InferenceEngine | null;
  letter: string | null;
  confidence: number;
  stable: boolean;
  progress: number;
  acceptedLetter: string | null;
}

export function useRecognition(hands: DetectedHand[], enabled: boolean) {
  const modelRef = useRef<LocalModel | null>(null);
  const filterRef = useRef(new StabilityFilter(STABILITY));
  const [state, setState] = useState<RecognitionState>({
    loading: true,
    error: null,
    engine: null,
    letter: null,
    confidence: 0,
    stable: false,
    progress: 0,
    acceptedLetter: null,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const model = await loadLocalModel();
        if (cancelled) {
          model.dispose();
          return;
        }
        modelRef.current = model;
        setState((prev) => ({
          ...prev,
          loading: false,
          engine: model.engine,
        }));
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Model failed to load',
        }));
      }
    })();
    return () => {
      cancelled = true;
      modelRef.current?.dispose();
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !modelRef.current) return;

    const features = extractHandFeatures(hands);
    if (!features) {
      filterRef.current.push(null, 0);
      setState((prev) => ({
        ...prev,
        letter: null,
        confidence: 0,
        stable: false,
        progress: 0,
        acceptedLetter: null,
      }));
      return;
    }

    try {
      const prediction = modelRef.current.predict(features);
      const result = filterRef.current.push(
        prediction.letter,
        prediction.confidence,
      );
      setState((prev) => ({
        ...prev,
        letter: result.current,
        confidence: result.confidence,
        stable: result.stable,
        progress: result.progress,
        acceptedLetter: result.accepted,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Prediction failed',
      }));
    }
  }, [enabled, hands]);

  return state;
}
