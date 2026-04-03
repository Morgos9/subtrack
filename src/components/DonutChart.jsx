import { useId, useMemo } from 'react';
import { CATEGORIES } from '../data/subscriptions';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(value);

export default function DonutChart({ subscriptions }) {
  const glowId = useId().replace(/:/g, '');

  const { total, segments, activeCount } = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');
    const totalValue = activeSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    const categories = Object.entries(
      activeSubscriptions.reduce((accumulator, sub) => {
        accumulator[sub.category] = (accumulator[sub.category] || 0) + sub.cost;
        return accumulator;
      }, {}),
    )
      .map(([category, amount]) => ({
        category,
        amount,
        color: CATEGORIES[category]?.color ?? '#94a3b8',
      }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5);

    // Visual-only chart geometry (kept separate from data aggregation)
    const ringRadius = 76;
    const circumference = 2 * Math.PI * ringRadius;
    const strokeWidth = 16;
    // Gap is in "path length units" and prevents overlap (esp. with round line caps)
    const segmentGap = strokeWidth + 2;
    const computedSegments = categories.reduce(
      ({ offset: currentOffset, segments: currentSegments }, segment) => {
        const ratio = totalValue ? segment.amount / totalValue : 0;
        const dashLength = Math.max(ratio * circumference - segmentGap, 0);

        return {
          offset: currentOffset + ratio * circumference,
          segments: [
            ...currentSegments,
            {
              ...segment,
              ratio,
              strokeWidth,
              dashArray: `${dashLength} ${circumference - dashLength}`,
              dashOffset: -currentOffset,
            },
          ],
        };
      },
      { offset: 0, segments: [] },
    ).segments;

    return {
      total: totalValue,
      segments: computedSegments,
      activeCount: activeSubscriptions.length,
    };
  }, [subscriptions]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">Ausgaben nach Kategorie</p>
          <p className="text-sm text-[var(--text-3)]">Verteilung der aktiven Services pro Monat.</p>
        </div>
        <span className="dashboard-pill">{activeCount} aktiv</span>
      </div>

      <div className="mt-6 flex flex-1 flex-col justify-between gap-6">
        <div className="flex flex-1 items-center justify-center">
          <div className="relative h-[204px] w-[204px]">
            <svg
              width="204"
              height="204"
              viewBox="0 0 204 204"
              role="img"
              aria-label="Ausgaben nach Kategorie"
            >
              <defs>
                <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0, 0, 0, 0.35)" />
                </filter>
              </defs>

              <circle
                cx="102"
                cy="102"
                r="76"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="18"
              />

              <g transform="rotate(-90 102 102)">
                {segments.map((segment) => (
                  <g key={segment.category}>
                    <circle
                      cx="102"
                      cy="102"
                      r="76"
                      fill="none"
                      stroke="var(--bg)"
                      strokeWidth={segment.strokeWidth + 4}
                      strokeLinecap="round"
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                    />
                    <circle
                      cx="102"
                      cy="102"
                      r="76"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={segment.strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                      filter={`url(#${glowId})`}
                    />
                  </g>
                ))}
              </g>
            </svg>

            <div className="absolute inset-[38px] flex flex-col items-center justify-center rounded-full border border-[var(--border)] bg-[radial-gradient(circle_at_top,rgba(183,243,107,0.12),transparent_60%),rgba(11,16,13,0.92)] text-center shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-3)]">
                Pro Monat
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums tracking-[-0.04em] text-[var(--text-1)]">
                {formatCurrency(total)}
              </p>
              <p className="mt-2 text-sm text-[var(--text-3)]">{activeCount} aktive Abos</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {segments.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm text-[var(--text-3)]">
              Keine aktiven Abos vorhanden.
            </div>
          )}

          {segments.map((segment) => (
            <div
              key={segment.category}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: segment.color, boxShadow: `0 0 18px ${segment.color}40` }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-1)]">
                    {segment.category}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[var(--text-3)]">
                    {percentFormatter.format(segment.ratio * 100)}%
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-1)]">
                  {formatCurrency(segment.amount)}
                </p>
                <p className="mt-1 text-xs text-[var(--text-3)]">
                  {formatCurrency(segment.amount * 12)} / Jahr
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
