import { addDays, parseISODateLocal, startOfDay } from '../utils/date';
import { CATEGORIES } from '../data/subscriptions';

// Transaction-list style — inspired by the Transactions panel in the mockup
export default function UpcomingBills({ subscriptions }) {
  const today = startOfDay(new Date());
  const in30 = addDays(today, 30);

  const upcoming = subscriptions
    .filter(s => s.status === 'active')
    .map(s => ({ ...s, date: parseISODateLocal(s.nextBilling) }))
    .filter(s => s.date && s.date >= today && s.date <= in30)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  return (
    <div className="flex min-h-[320px] flex-col gap-4 h-full">
      <p className="text-xs text-[var(--text-3)] uppercase tracking-widest font-medium">Bevorstehende Zahlungen</p>

      <div className="flex flex-1 flex-col">
        {upcoming.length === 0 && (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-[var(--text-3)]">Keine Zahlungen in 30 Tagen.</p>
        )}
        {upcoming.map(s => {
          const catColor = CATEGORIES[s.category]?.color || '#94a3b8';
          const daysLeft = Math.ceil((s.date - today) / (1000 * 60 * 60 * 24));
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 border-b border-[var(--border)] py-3 first:pt-0 last:border-0 last:pb-0"
            >
              {/* Service avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 font-medium"
                style={{ background: `${catColor}20`, border: `1.5px solid ${catColor}40` }}
              >
                {s.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-1)] leading-none">{s.name}</p>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  {daysLeft === 0 ? 'Heute' : daysLeft === 1 ? 'Morgen' : `in ${daysLeft} Tagen`}
                </p>
              </div>

              <span className="text-sm font-bold text-[var(--accent)] tabular-nums whitespace-nowrap">
                -{s.cost.toFixed(2)}€
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
