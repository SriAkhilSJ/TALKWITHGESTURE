interface Props {
  visible: boolean;
  stepLabel: string | null;
}

export function DemoBanner({ visible, stepLabel }: Props) {
  if (!visible) return null;
  return (
    <div className="border-b border-counter-gold bg-counter-gold px-5 py-3 text-center text-counter-bg">
      <p className="text-sm font-black uppercase tracking-[0.18em]">
        Demo mode — controlled railway sequence, not live recognition
      </p>
      {stepLabel && <p className="text-lg font-semibold">{stepLabel}</p>}
    </div>
  );
}
