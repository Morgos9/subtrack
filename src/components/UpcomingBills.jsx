import { addDays, formatDateDE, parseISODateLocal, startOfDay } from '../utils/date';

export default function UpcomingBills({ subscriptions }) {
  const today = startOfDay(new Date());
  const in30 = addDays(today, 30);

  const upcoming = subscriptions
    .filter(s => s.status === 'active')
    .map(s => ({ ...s, date: parseISODateLocal(s.nextBilling) }))
    .filter(s => s.date && s.date >= today && s.date <= in30)
    .sort((a, b) => a.date - b.date);

  const fmt = date => formatDateDE(date, { day: '2-digit', month: 'short' });

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Bevorstehende Zahlungen (30 Tage)</h2>
      <div className="flex flex-col gap-2">
        {upcoming.length === 0 && (
          <p className="text-slate-500 text-sm">Keine bevorstehenden Zahlungen.</p>
        )}
        {upcoming.map(s => {
          const daysLeft = Math.ceil((s.date - today) / (1000 * 60 * 60 * 24));
          return (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{s.name}</p>
                  <p className="text-xs text-slate-500">{fmt(s.date)} · in {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tagen'}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-amber-400">{s.cost.toFixed(2)}€</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
