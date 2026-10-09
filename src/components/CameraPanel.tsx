import type { RefObject } from 'react';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  active: boolean;
  handCount: number;
  trackingReady: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
}

export function CameraPanel({
  videoRef,
  canvasRef,
  active,
  handCount,
  trackingReady,
  onStart,
  onStop,
  error,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-counter-line bg-black">
      <div className="flex items-center justify-between border-b border-counter-line bg-counter-panel px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-counter-mute">
            Citizen camera
          </p>
          <h2 className="text-lg font-semibold">Counter-mounted view</h2>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-counter-mute">Hands</p>
          <p className="text-2xl font-bold text-counter-gold">{handCount}</p>
        </div>
      </div>
      <div className="relative aspect-video bg-zinc-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: 'scaleX(-1)', display: active ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ display: active ? 'block' : 'none' }}
        />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">Stand in front of the counter camera</p>
            <p className="max-w-md text-sm text-counter-mute">
              The citizen does not hold a phone. Both hands remain free for Indian Sign
              Language. Recognition runs on this device.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-2 rounded-xl bg-counter-gold px-6 py-3 text-base font-bold text-counter-bg"
            >
              Start camera
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-counter-panel px-4 py-3">
        <p className="text-sm text-counter-mute">
          {active
            ? trackingReady
              ? 'Local hand tracking active'
              : 'Loading MediaPipe hands…'
            : 'Camera idle'}
        </p>
        {active && (
          <button
            type="button"
            onClick={onStop}
            className="rounded-lg bg-counter-bad px-4 py-2 text-sm font-semibold text-white"
          >
            Stop camera
          </button>
        )}
      </div>
      {error && (
        <p className="bg-counter-bad/15 px-4 py-2 text-sm text-counter-bad">{error}</p>
      )}
    </section>
  );
}
