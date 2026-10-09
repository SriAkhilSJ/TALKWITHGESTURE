import type { VocabularyEntry } from '../data/vocabulary';

interface Props {
  items: VocabularyEntry[];
  onPick: (entry: VocabularyEntry) => void;
}

export function VocabularyRail({ items, onPick }: Props) {
  return (
    <section className="rounded-2xl border border-counter-line bg-counter-panel p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-counter-mute">
        Supported service vocabulary · alphabet model shortcuts
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.sign}
            type="button"
            onClick={() => onPick(item)}
            className="rounded-full border border-counter-line bg-counter-panel2 px-3 py-2 text-left"
            title={`${item.sign} is triggered by letter ${item.shortcut} in Service mode, or by spelling ${item.letters}`}
          >
            <span className="mr-2 font-black text-counter-gold">{item.shortcut}</span>
            <span className="font-semibold">{item.sign}</span>
            <span className="ml-2 text-xs text-counter-mute">{item.phrase}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
