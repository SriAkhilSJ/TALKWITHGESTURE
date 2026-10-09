import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Hands } from '@mediapipe/hands';
import { MEDIAPIPE_ASSET_BASE, MEDIAPIPE_OPTIONS } from '../config/constants';
import { drawHands } from '../lib/drawing';
import { parseMediaPipeHands } from '../lib/features';
import type { DetectedHand } from '../lib/types';

export function useHands(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
) {
  const [hands, setHands] = useState<DetectedHand[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<Hands | null>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  useEffect(() => {
    if (!active) {
      stopLoop();
      setHands([]);
      return;
    }

    let cancelled = false;

    const boot = async () => {
      try {
        const engine = new Hands({
          locateFile: (file: string) => `${MEDIAPIPE_ASSET_BASE}/${file}`,
        });
        engine.setOptions(MEDIAPIPE_OPTIONS);
        engine.onResults((results) => {
          const detected = parseMediaPipeHands(results);
          setHands(detected);
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas) drawHands(canvas, video, detected);
        });
        if (typeof engine.initialize === 'function') {
          await engine.initialize();
        }
        if (cancelled) {
          engine.close();
          return;
        }
        engineRef.current = engine;
        setReady(true);
        runningRef.current = true;

        const tick = async () => {
          if (!runningRef.current) return;
          const video = videoRef.current;
          if (video && video.readyState >= 2) {
            try {
              await engine.send({ image: video });
            } catch {
              /* frame dropped — never crash when a hand disappears */
            }
          }
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
        };
        void tick();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Hand tracking failed to load',
        );
      }
    };

    void boot();

    return () => {
      cancelled = true;
      stopLoop();
      engineRef.current?.close();
      engineRef.current = null;
      setReady(false);
    };
  }, [active, canvasRef, stopLoop, videoRef]);

  return { hands, ready, error, handCount: hands.length };
}
