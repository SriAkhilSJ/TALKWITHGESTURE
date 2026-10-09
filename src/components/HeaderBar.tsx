import type { CounterLocation } from '../config/constants';
import { LOCATIONS } from '../config/constants';

interface Props {
  online: boolean;
  engine: string | null;
  location: CounterLocation;
  onLocation: (value: CounterLocation) => void;
  demo: boolean;
  onToggleDemo: () => void;
}

export function HeaderBar({
  online,
  engine,
  location,
  onLocation,
  demo,
  onToggleDemo,
}: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-counter-line bg-counter-panel px-5 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-counter-gold">
          Public-service counter
        </p>
        <h1 className="text-2xl font-bold text-counter-text sm:text-3xl">
          ISL Counter
        </h1>
        <p className="text-sm text-counter-mute">
          Offline Indian Sign Language assistant · camera is mounted, both hands stay free
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${
            online
              ? 'border-counter-ok/40 bg-counter-ok/10 text-counter-ok'
              : 'border-counter-gold/50 bg-counter-gold/10 text-counter-gold'
          }`}
        >
          {online ? 'Online assets cached' : 'Offline · local recognition'}
        </span>
        {engine && (
          <span className="rounded-full border border-counter-line px-3 py-1 text-xs uppercase tracking-wide text-counter-mute">
            Model: {engine}
          </span>
        )}
        <label className="text-sm text-counter-mute">
          Desk
          <select
            className="ml-2 rounded-lg border border-counter-line bg-counter-panel2 px-3 py-2 text-counter-text"
            value={location}
            onChange={(event) => onLocation(event.target.value as CounterLocation)}
          >
            {LOCATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onToggleDemo}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            demo
              ? 'bg-counter-gold text-counter-bg'
              : 'border border-counter-gold text-counter-gold'
          }`}
        >
          {demo ? 'Exit demo' : 'Railway demo'}
        </button>
      </div>
    </header>
  );
}
