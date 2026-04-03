import { CATEGORIES } from '../data/subscriptions';
import { useMemo } from 'react';

export default function DonutChart({ subscriptions }) {
  const { total, byCategory, segments } = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const total = active.reduce((sum, s) => sum + s.cost, 0);

    const byCategory = Object.entries(
      active.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.cost;
        return acc;
      }, {})
    )
      .map(([cat, amount]) => ({
        cat,
        amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORIES[cat]?.color || '#6B7280',
      }))
      .sort((a, b) => b.amount - a.amount);

    const r = 70;
    const circ = 2 * Math.PI * r;

    const { segments } = byCategory.reduce(
      (acc, seg) => {
        const dashLen = total > 0 ? (seg.amount / total) * circ : 0;
        const dashGap = Math.max(0, circ - dashLen);
        const el = { ...seg, dashLen, dashGap, offset: acc.offset };
        return {
          offset: acc.offset + dashLen,
          segments: [...acc.segments, el],
        };
      },
      { offset: 0, segments: [] }
    );

    return { total, byCategory, segments };
  }, [subscriptions]);

  // SVG donut
  const r = 70;
  const cx = 90;
  const cy = 90;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ausgaben nach Kategorie</h2>
      <div className="flex items-center gap-6">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="shrink-0"
          role="img"
          aria-label="Donut-Chart: Ausgaben nach Kategorie"
        >
          <title>Ausgaben nach Kategorie</title>
          <desc>Anteile der monatlichen aktiven Abonnements nach Kategorie.</desc>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth="28" />
          {segments.map(seg => (
            <circle
              key={seg.cat}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="28"
              strokeDasharray={`${seg.dashLen} ${seg.dashGap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
            />
          ))}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="700">
            {total.toFixed(0)}€
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="10">
            / Monat
          </text>
        </svg>

        <div className="flex flex-col gap-2 flex-1">
          {byCategory.length === 0 && (
            <p className="text-sm text-slate-500">Keine aktiven Abos.</p>
          )}
          {byCategory.map(seg => (
            <div key={seg.cat} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-slate-300">{seg.cat}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">{seg.pct.toFixed(0)}%</span>
                <span className="text-slate-200 font-medium w-16 text-right">{seg.amount.toFixed(2)}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
