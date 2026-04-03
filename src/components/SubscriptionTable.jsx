import { CATEGORIES } from '../data/subscriptions';
import { formatDateDE, parseISODateLocal } from '../utils/date';

const STATUS_STYLES = {
  active: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50',
  paused: 'bg-amber-900/50 text-amber-400 border border-amber-700/50',
  cancelled: 'bg-red-900/50 text-red-400 border border-red-700/50',
};

const STATUS_LABELS = { active: 'Aktiv', paused: 'Pausiert', cancelled: 'Gekündigt' };

export default function SubscriptionTable({ subscriptions, onEdit, onDelete }) {
  const fmt = (dateStr) => {
    const d = parseISODateLocal(dateStr);
    if (!d) return '—';
    return formatDateDE(d, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Abonnement-Tabelle</caption>
        <thead>
          <tr className="border-b border-slate-700">
            {['Dienst', 'Kategorie', 'Kosten/Mo.', 'Nächste Abbuchung', 'Status', ''].map(h => (
              <th
                key={h}
                scope="col"
                className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 && (
            <tr className="border-b border-slate-700/50">
              <td className="py-6 px-4 text-slate-500" colSpan={6}>
                Keine Abonnements gefunden.
              </td>
            </tr>
          )}
          {subscriptions.map(sub => (
            <tr
              key={sub.id}
              className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group"
            >
              <th scope="row" className="py-3 px-4 font-normal text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sub.icon}</span>
                  <span className="font-medium text-slate-200">{sub.name}</span>
                </div>
              </th>
              <td className="py-3 px-4">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: CATEGORIES[sub.category]?.bg || '#1f2937',
                    color: CATEGORIES[sub.category]?.color || '#9ca3af',
                  }}
                >
                  {sub.category}
                </span>
              </td>
              <td className="py-3 px-4 font-semibold text-slate-200">{sub.cost.toFixed(2)}€</td>
              <td className="py-3 px-4 text-slate-400">{fmt(sub.nextBilling)}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[sub.status]}`}>
                  {STATUS_LABELS[sub.status]}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit(sub)}
                    className="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-slate-200 transition-colors"
                    aria-label={`Abo bearbeiten: ${sub.name}`}
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(sub.id)}
                    className="text-xs px-2 py-1 rounded bg-red-900/50 hover:bg-red-800/60 text-red-400 transition-colors"
                    aria-label={`Abo löschen: ${sub.name}`}
                  >
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
