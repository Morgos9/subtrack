// Inspired by the "Rewards" panel in the mockup — adapted as savings tips
const TIPS = [
  { id: 1, done: true,  title: 'Jahresabo prüfen',  sub: 'Bis zu 20% günstiger als monatlich' },
  { id: 2, done: true,  title: 'Familien-Plan nutzen', sub: 'Kosten auf mehrere Personen verteilen' },
  { id: 3, done: false, title: 'Pausierte Abos kündigen', sub: 'Potenzial: ~8.99€ Ersparnis/Monat' },
];

export default function TipsPanel({ onAddSub }) {
  return (
    <div className="flex min-h-[320px] flex-col gap-4 h-full">
      <p className="text-xs text-[var(--text-3)] uppercase tracking-widest font-medium">Spartipps</p>

      <div className="flex flex-col gap-3 flex-1">
        {TIPS.map(tip => (
          <div key={tip.id} className="flex items-start gap-3 py-1">
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: tip.done ? 'rgba(163,230,53,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${tip.done ? '#a3e635' : '#243328'}`,
              }}
            >
              {tip.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-1)] leading-none">{tip.title}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{tip.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSub}
        className="mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all"
        style={{
          background: 'linear-gradient(135deg, #a3e635, #6bbf1c)',
          color: '#0d1410',
          boxShadow: '0 0 20px rgba(163,230,53,0.25)',
        }}
      >
        + Abo hinzufügen
      </button>
    </div>
  );
}
