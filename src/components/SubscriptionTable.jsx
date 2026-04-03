import { CATEGORIES } from '../data/subscriptions';
import { formatDateDE, parseISODateLocal } from '../utils/date';

const STATUS_STYLES = {
  active:    { bg: 'rgba(163,230,53,0.12)',  color: '#a3e635',  label: 'Aktiv' },
  paused:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24',  label: 'Pausiert' },
  cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171',  label: 'Gekündigt' },
};

const HEADERS = ['Dienst', 'Kategorie', 'Kosten/Mo.', 'Nächste Abbuchung', 'Status', ''];

export default function SubscriptionTable({ subscriptions, onEdit, onDelete }) {
  const fmt = (dateStr) => {
    const d = parseISODateLocal(dateStr);
    if (!d) return '—';
    return formatDateDE(d, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Abonnement-Tabelle">
        <caption className="sr-only">Abonnements</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {HEADERS.map(h => (
              <th
                key={h}
                scope="col"
                className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 && (
            <tr>
              <td className="py-8 px-4 text-center" style={{ color: 'var(--text-3)' }} colSpan={6}>
                Keine Abonnements gefunden.
              </td>
            </tr>
          )}
          {subscriptions.map(sub => {
            const catStyle = CATEGORIES[sub.category] || CATEGORIES.Other;
            const st = STATUS_STYLES[sub.status] || STATUS_STYLES.cancelled;
            return (
              <tr
                key={sub.id}
                className="group transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(163,230,53,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <th scope="row" className="py-4 px-4 font-normal text-left">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ background: catStyle.bg }}
                    >
                      {sub.icon}
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{sub.name}</span>
                  </div>
                </th>
                <td className="py-4 px-4">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ background: catStyle.bg, color: catStyle.color }}
                  >
                    {sub.category}
                  </span>
                </td>
                <td className="py-4 px-4 font-bold tabular-nums" style={{ color: 'var(--text-1)' }}>
                  {sub.cost.toFixed(2)}€
                </td>
                <td className="py-4 px-4 text-xs" style={{ color: 'var(--text-3)' }}>
                  {fmt(sub.nextBilling)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                      aria-label={`Bearbeiten: ${sub.name}`}
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                      aria-label={`Löschen: ${sub.name}`}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
