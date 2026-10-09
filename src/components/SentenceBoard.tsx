interface Props {
  text: string;
  spelled: string;
  onSpeak: () => void;
  onStopSpeak: () => void;
  onUndo: () => void;
  onClear: () => void;
  onEdit: (value: string) => void;
}

export function SentenceBoard({
  text,
  spelled,
  onSpeak,
  onStopSpeak,
  onUndo,
  onClear,
  onEdit,
}: Props) {
  return (
    <section className="rounded-2xl border border-counter-gold/40 bg-counter-panel p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-counter-gold">
        Message for staff
      </p>
      <p className="mt-3 min-h-[3.5rem] break-words text-4xl font-black leading-tight text-white sm:text-5xl">
        {text || 'Waiting for a stable sign…'}
      </p>
      {spelled && (
        <p className="mt-2 text-lg text-counter-gold">Spelling: {spelled}</p>
      )}
      <textarea
        aria-label="Edit recognized text"
        className="mt-4 w-full rounded-xl border border-counter-line bg-counter-panel2 p-3 text-lg text-counter-text"
        rows={2}
        value={text}
        onChange={(event) => onEdit(event.target.value)}
        placeholder="Edit the sentence if needed"
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={onSpeak}
          className="rounded-xl bg-counter-gold py-3 text-base font-bold text-counter-bg"
        >
          Speak
        </button>
        <button
          type="button"
          onClick={onStopSpeak}
          className="rounded-xl border border-counter-line py-3 font-semibold"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-xl border border-counter-line py-3 font-semibold"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl bg-counter-bad/80 py-3 font-semibold text-white"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
