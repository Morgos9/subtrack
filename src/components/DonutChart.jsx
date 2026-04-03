import { CATEGORIES } from '../data/subscriptions';
import { useMemo } from 'react';

// Concentric circles style — inspired by the Annual Profit chart in the mockup
export default function DonutChart({ subscriptions }) {
  const { total, rings } = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const total = active.reduce((sum, s) => sum + s.cost, 0);

    const byCategory = Object.entries(
      active.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.cost;
        return acc;
      }, {})
    )
      .map(([cat, amount]) => ({ cat, amount, color: CATEGORIES[cat]?.color || '#6B7280' }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // Concentric rings: largest category = outermost ring
    const rings = byCategory.map((cat, i) => ({
      ...cat,
      r: 72 - i * 16,
      opacity: 1 - i * 0.15,
    }));

    return { total, rings };
  }, [subscriptions]);

  const cx = 90;
  const cy = 90;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-3)] uppercase tracking-widest font-medium">Ausgaben nach Kategorie</p>
      </div>

      <div className="flex items-center gap-5 flex-1">
        <div className="shrink-0 relative">
          <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Ausgaben nach Kategorie">
            <title>Ausgaben nach Kategorie</title>
            {/* Background circle */}
            <circle cx={cx} cy={cy} r="80" fill="rgba(255,255,255,0.02)" />

            {/* Concentric filled circles */}
            {[...rings].reverse().map((ring, i) => (
              <circle
                key={ring.cat}
                cx={cx} cy={cy} r={ring.r}
                fill={ring.color}
                opacity={ring.opacity * 0.75}
                style={{ transition: 'r 0.5s ease, opacity 0.5s ease' }}
              />
            ))}

            {/* Center label */}
            <text x={cx} y={cy - 8} textAnchor="middle" fill="#f0fff4" fontSize="17" fontWeight="700">
              {total.toFixed(0)}€
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#4d7a58" fontSize="10">
              / Monat
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {rings.length === 0 && (
            <p className="text-sm text-[var(--text-3)]">Keine aktiven Abos.</p>
          )}
          {rings.map(ring => (
            <div key={ring.cat} className="flex items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ring.color }} />
                <span className="text-[var(--text-2)] text-xs truncate">{ring.cat}</span>
              </div>
              <span className="text-[var(--text-1)] font-semibold text-xs whitespace-nowrap">
                {ring.amount.toFixed(2)}€
              </span>
            </div>
          ))}
          {rings.length > 0 && (
            <div className="mt-1 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-[var(--text-3)] text-xs">Gesamt/Jahr</span>
                <span className="text-[var(--accent)] font-bold text-xs">{(total * 12).toFixed(0)}€</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
