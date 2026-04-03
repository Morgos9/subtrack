import { CATEGORIES } from '../data/subscriptions';
import { formatDateDE, parseISODateLocal } from '../utils/date';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(value);

const STATUS_STYLES = {
  active: {
    bg: 'rgba(183, 243, 107, 0.14)',
    color: 'var(--accent)',
    label: 'Aktiv',
  },
  paused: {
    bg: 'rgba(251, 191, 36, 0.14)',
    color: 'var(--warning)',
    label: 'Pausiert',
  },
  cancelled: {
    bg: 'rgba(251, 113, 133, 0.14)',
    color: 'var(--danger)',
    label: 'Gekündigt',
  },
};

const HEADERS = ['Dienst', 'Kategorie', 'Kosten / Mo.', 'Nächste Abbuchung', 'Status', 'Aktionen'];

export default function SubscriptionTable({ subscriptions, onEdit, onDelete }) {
  const formatBillingDate = (dateString) => {
    const parsed = parseISODateLocal(dateString);
    if (!parsed) return '—';
    return formatDateDE(parsed, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-sm" aria-label="Abonnement-Tabelle">
        <caption className="sr-only">Abonnements</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {HEADERS.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-widest text-[var(--text-3)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {subscriptions.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-[var(--text-3)]"
              >
                Keine Abonnements gefunden.
              </td>
            </tr>
          )}

          {subscriptions.map((sub) => {
            const category = CATEGORIES[sub.category] ?? CATEGORIES.Other;
            const status = STATUS_STYLES[sub.status] ?? STATUS_STYLES.cancelled;

            return (
              <tr
                key={sub.id}
                className="group transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <th scope="row" className="px-4 py-4 text-left align-middle font-normal">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
                      style={{
                        background: category.bg,
                        border: `1px solid ${category.color}20`,
                      }}
                    >
                      {sub.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-1)]">
                        {sub.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-[var(--text-3)]">
                        {sub.billing}
                      </p>
                    </div>
                  </div>
                </th>

                <td className="px-4 py-4 align-middle">
                  <span
                    className="inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-widest"
                    style={{
                      background: category.bg,
                      color: category.color,
                    }}
                  >
                    {sub.category}
                  </span>
                </td>

                <td className="px-4 py-4 align-middle text-sm font-semibold tabular-nums text-[var(--text-1)]">
                  {formatCurrency(sub.cost)}
                </td>

                <td className="px-4 py-4 align-middle">
                  <div className="text-sm text-[var(--text-1)]">
                    {formatBillingDate(sub.nextBilling)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-[var(--text-3)]">
                    geplant
                  </div>
                </td>

                <td className="px-4 py-4 align-middle">
                  <span
                    className="inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-widest"
                    style={{
                      background: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-4 py-4 align-middle">
                  <div className="flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
                      aria-label={`Bearbeiten: ${sub.name}`}
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      className="rounded-xl border border-[rgba(251,113,133,0.22)] bg-[rgba(251,113,133,0.10)] px-3 py-2 text-xs font-semibold text-[var(--danger)] transition-colors hover:bg-[rgba(251,113,133,0.16)]"
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
