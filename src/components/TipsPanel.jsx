import { useMemo } from 'react';

function buildDynamicTips(subscriptions, formatCurrency) {
  const tips = [];

  const active = subscriptions.filter((s) => s.status === 'active');
  const paused = subscriptions.filter((s) => s.status === 'paused');

  // Tip: pausierte Abos kündigen
  if (paused.length > 0) {
    const savings = paused.reduce((sum, s) => sum + s.cost, 0);
    tips.push({
      id: 'paused',
      done: false,
      title: `${paused.length} pausierte${paused.length === 1 ? 's Abo' : ' Abos'} kündigen`,
      sub: `Sofortpotenzial: ${formatCurrency(savings)} Ersparnis pro Monat.`,
    });
  }

  // Tip: Jahresabo prüfen (monatliche Abos mit Kosten > 5€)
  const monthlyExpensive = active.filter((s) => s.billing === 'monthly' && s.cost > 5);
  if (monthlyExpensive.length > 0) {
    tips.push({
      id: 'yearly',
      done: false,
      title: 'Jahresabo prüfen',
      sub: `${monthlyExpensive.length} Abo${monthlyExpensive.length === 1 ? '' : 's'} könnte${monthlyExpensive.length === 1 ? '' : 'n'} als Jahresplan bis zu 20% günstiger sein.`,
    });
  }

  // Tip: Duplikate in gleicher Kategorie
  const categoryCount = active.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const dupCategory = Object.entries(categoryCount).find(([, count]) => count >= 2);
  if (dupCategory) {
    tips.push({
      id: 'duplicate',
      done: false,
      title: `Doppelte ${dupCategory[0]}-Abos prüfen`,
      sub: `Du hast ${dupCategory[1]} aktive Abos in der Kategorie "${dupCategory[0]}". Prüfe ob alle nötig sind.`,
    });
  }

  // Tip: Familien-Plan (wenn Streaming vorhanden)
  const streaming = active.filter((s) => s.category === 'Streaming');
  if (streaming.length >= 2) {
    tips.push({
      id: 'family',
      done: false,
      title: 'Familien-Plan nutzen',
      sub: 'Kosten auf mehrere Nutzer verteilen und Streaming-Redundanzen abbauen.',
    });
  }

  // Fallback wenn nichts zutrifft
  if (tips.length === 0) {
    tips.push({
      id: 'good',
      done: true,
      title: 'Portfolio gut aufgestellt',
      sub: 'Keine offensichtlichen Einsparpotenziale gefunden. Weiter so!',
    });
  }

  return tips.slice(0, 3);
}

export default function TipsPanel({ onAddSub, subscriptions = [], formatCurrency }) {
  const fmt = formatCurrency ?? ((v) => `${Number(v).toFixed(2)} €`);

  const tips = useMemo(
    () => buildDynamicTips(subscriptions, fmt),
    [subscriptions, fmt],
  );

  const completedTips = tips.filter((tip) => tip.done).length;

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
          {completedTips}/{tips.length}
        </span>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="glass-sub-card rounded-2xl px-4 py-4"
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
