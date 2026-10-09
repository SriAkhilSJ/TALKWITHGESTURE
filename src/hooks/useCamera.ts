import { useCallback, useRef, useState } from 'react';
import { VIDEO_CONSTRAINTS } from '../config/constants';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Camera element is not ready');
      }
      video.srcObject = stream;
      await video.play();
      setActive(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Camera permission was denied';
      setError(message);
      setActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  return { videoRef, active, error, start, stop };
}
