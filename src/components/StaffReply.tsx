interface Props {
  supported: boolean;
  listening: boolean;
  text: string;
  error: string | null;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export function StaffReply({
  supported,
  listening,
  text,
  error,
  onToggle,
  onChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-counter-line bg-counter-panel p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-counter-mute">
        Staff reply · large text for the citizen
      </p>
      <p className="mt-3 min-h-[4.5rem] text-3xl font-bold leading-snug text-counter-gold sm:text-4xl">
        {text || (supported ? 'Staff can speak or type a reply' : 'Type a reply for the citizen')}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-xl px-5 py-3 font-semibold ${
            listening ? 'bg-counter-bad text-white' : 'bg-counter-ok text-counter-bg'
          }`}
        >
          {listening ? 'Stop microphone' : 'Staff microphone'}
        </button>
        {!supported && (
          <p className="self-center text-sm text-counter-warn">
            Browser speech-to-text is unavailable. Typing still works.
          </p>
        )}
      </div>
      <textarea
        aria-label="Staff reply text"
        className="mt-4 w-full rounded-xl border border-counter-line bg-counter-panel2 p-3 text-lg"
        rows={2}
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type the reply shown to the citizen"
      />
      {error && <p className="mt-2 text-sm text-counter-bad">{error}</p>}
    </section>
  );
}
