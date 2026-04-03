const TIPS = [
  {
    id: 1,
    done: true,
    title: 'Jahresabo prüfen',
    sub: 'Bis zu 20% günstiger als monatliche Abrechnung.',
  },
  {
    id: 2,
    done: true,
    title: 'Familien-Plan nutzen',
    sub: 'Kosten auf mehrere Nutzer verteilen und Redundanzen abbauen.',
  },
  {
    id: 3,
    done: false,
    title: 'Pausierte Abos kündigen',
    sub: 'Sofortpotenzial: rund 8,99 € Ersparnis pro Monat.',
  },
];

export default function TipsPanel({ onAddSub }) {
  const completedTips = TIPS.filter((tip) => tip.done).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">Spartipps</p>
          <p className="text-sm text-[var(--text-3)]">
            Kleine Optimierungen mit direkter Auswirkung auf die Runrate.
          </p>
        </div>
        <span className="dashboard-pill dashboard-pill--accent">
          {completedTips}/{TIPS.length}
        </span>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {TIPS.map((tip) => (
          <div
            key={tip.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: tip.done ? 'rgba(var(--accent-rgb), 0.16)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${tip.done ? 'rgba(var(--accent-rgb), 0.28)' : 'rgba(255, 255, 255, 0.08)'}`,
                }}
              >
                {tip.done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.25 4.9 8.5 9.5 3.75"
                      stroke="var(--accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[var(--text-4)]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text-1)]">{tip.title}</p>
                  <span className={`dashboard-pill ${tip.done ? 'dashboard-pill--accent' : ''}`}>
                    {tip.done ? 'Erledigt' : 'Offen'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{tip.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSub}
        className="dashboard-button mt-6 w-full justify-center"
      >
        Abo hinzufügen
      </button>
    </div>
  );
}
