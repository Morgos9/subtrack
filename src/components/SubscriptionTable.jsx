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
    className: 'status-badge status-badge--active',
    label: 'Aktiv',
  },
  paused: {
    className: 'status-badge status-badge--paused',
    label: 'Pausiert',
  },
  cancelled: {
    className: 'status-badge status-badge--cancelled',
    label: 'Gekündigt',
  },
};

const BILLING_LABELS = {
  monthly: 'Monatlich',
  quarterly: 'Quartalsweise',
  yearly: 'Jährlich',
};

const HEADERS = [
  'Dienst',
  'Kategorie',
  'Kosten / Mo.',
  'Nächste Abbuchung',
  'Status',
  'Aktionen',
];

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

  const renderEmptyState = () => (
    <div className="empty-state-card">
      <p className="text-sm font-medium text-[var(--text-2)]">
        Keine Abonnements gefunden.
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">
        Passe Suchbegriff oder Statusfilter an, um wieder Treffer zu sehen.
      </p>
    </div>
  );

  if (subscriptions.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:hidden">
        {subscriptions.map((sub) => {
          const category = CATEGORIES[sub.category] ?? CATEGORIES.Other;
          const status = STATUS_STYLES[sub.status] ?? STATUS_STYLES.cancelled;

          return (
            <article key={sub.id} className="mobile-subscription-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg"
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
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">
                      {BILLING_LABELS[sub.billing] ?? sub.billing}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--text-1)]">
                    {formatCurrency(sub.cost)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-3)]">pro Monat</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className="category-badge"
                  style={{ background: category.bg, color: category.color }}
                >
                  {sub.category}
                </span>
                <span className={status.className}>{status.label}</span>
              </div>

              <div className="mt-4 grid gap-3 min-[480px]:grid-cols-2">
                <InfoTile label="Nächste Abbuchung" value={formatBillingDate(sub.nextBilling)} />
                <InfoTile
                  label="Abrechnung"
                  value={BILLING_LABELS[sub.billing] ?? sub.billing}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(sub)}
                  className="table-action flex-1"
                  aria-label={`Bearbeiten: ${sub.name}`}
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(sub.id)}
                  className="table-action table-action--danger flex-1"
                  aria-label={`Löschen: ${sub.name}`}
                >
                  Löschen
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] text-sm" aria-label="Abonnement-Tabelle">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((sub) => {
              const category = CATEGORIES[sub.category] ?? CATEGORIES.Other;
              const status = STATUS_STYLES[sub.status] ?? STATUS_STYLES.cancelled;

              return (
                <tr
                  key={sub.id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <th scope="row" className="px-4 py-4 text-left align-middle font-normal">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
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
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">
                          {BILLING_LABELS[sub.billing] ?? sub.billing}
                        </p>
                      </div>
                    </div>
                  </th>

                  <td className="px-4 py-4 align-middle">
                    <span
                      className="category-badge"
                      style={{ background: category.bg, color: category.color }}
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
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">
                      geplant
                    </div>
                  </td>

                  <td className="px-4 py-4 align-middle">
                    <span className={status.className}>{status.label}</span>
                  </td>

                  <td className="px-4 py-4 align-middle">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(sub)}
                        className="table-action"
                        aria-label={`Bearbeiten: ${sub.name}`}
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(sub.id)}
                        className="table-action table-action--danger"
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
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--text-1)]">{value}</p>
    </div>
  );
}
