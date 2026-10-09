interface Props {
  letter: string | null;
  phrasePreview: string;
  confidence: number;
  stable: boolean;
  progress: number;
  mode: 'service' | 'spell';
  onMode: (mode: 'service' | 'spell') => void;
}

export function DetectionPanel({
  letter,
  phrasePreview,
  confidence,
  stable,
  progress,
  mode,
  onMode,
}: Props) {
  const percent = Math.round(confidence * 100);
  return (
    <section className="rounded-2xl border border-counter-line bg-counter-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-counter-mute">
          Live recognition
        </p>
        <div className="flex rounded-lg border border-counter-line p-1">
          <button
            type="button"
            onClick={() => onMode('service')}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              mode === 'service' ? 'bg-counter-gold text-counter-bg' : 'text-counter-mute'
            }`}
          >
            Service
          </button>
          <button
            type="button"
            onClick={() => onMode('spell')}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              mode === 'spell' ? 'bg-counter-gold text-counter-bg' : 'text-counter-mute'
            }`}
          >
            Spell
          </button>
        </div>
      </div>
      <p className="text-sm text-counter-mute">Detected letter</p>
      <p className="font-sans text-7xl font-black leading-none text-counter-gold">
        {letter ?? '—'}
      </p>
      <p className="mt-3 text-2xl font-semibold text-counter-text">{phrasePreview}</p>
      <div className="mt-5">
        <div className="mb-1 flex justify-between text-sm">
          <span>Confidence {percent}%</span>
          <span className={stable ? 'text-counter-ok' : 'text-counter-warn'}>
            {stable ? 'Stable' : 'Holding…'}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-counter-panel2">
          <div
            className={`h-full ${stable ? 'bg-counter-ok' : 'bg-counter-gold'}`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
