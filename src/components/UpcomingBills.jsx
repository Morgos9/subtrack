import { addDays, formatDateDE, parseISODateLocal, startOfDay } from '../utils/date';
import { CATEGORIES } from '../data/subscriptions';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(value);

export default function UpcomingBills({ subscriptions }) {
  const today = startOfDay(new Date());
  const in30Days = addDays(today, 30);

  const upcoming = subscriptions
    .filter((sub) => sub.status === 'active')
    .map((sub) => ({ ...sub, date: parseISODateLocal(sub.nextBilling) }))
    .filter((sub) => sub.date && sub.date >= today && sub.date <= in30Days)
    .sort((left, right) => left.date - right.date)
    .slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">Bevorstehende Zahlungen</p>
          <p className="text-sm text-[var(--text-3)]">Die nächsten 30 Tage im Blick.</p>
        </div>
        <span className="dashboard-pill">{upcoming.length} geplant</span>
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        {upcoming.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-6 py-6 text-center text-sm text-[var(--text-3)]">
            Keine anstehenden Abbuchungen in den nächsten 30 Tagen.
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="flex flex-1 flex-col divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4">
            {upcoming.map((sub) => {
              const category = CATEGORIES[sub.category] ?? CATEGORIES.Other;
              const daysLeft = Math.ceil((sub.date - today) / (1000 * 60 * 60 * 24));
              const relativeLabel = daysLeft === 0
                ? 'Heute'
                : daysLeft === 1
                  ? 'Morgen'
                  : `In ${daysLeft} Tagen`;

              return (
                <div key={sub.id} className="flex items-center gap-4 py-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
                    style={{
                      background: `${category.color}20`,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    {sub.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--text-1)]">
                        {sub.name}
                      </p>
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-widest"
                        style={{
                          background: `${category.color}16`,
                          color: category.color,
                        }}
                      >
                        {sub.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-3)]">
                      {relativeLabel} / {formatDateDE(sub.date, { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-1)]">
                      {formatCurrency(sub.cost)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-[var(--text-3)]">
                      {formatDateDE(sub.date, { weekday: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
