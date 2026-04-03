import { useCallback, useMemo, useState } from 'react';
import { initialSubscriptions, monthlyHistory } from './data/subscriptions';
import DonutChart from './components/DonutChart';
import LineChart from './components/LineChart';
import UpcomingBills from './components/UpcomingBills';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';
import TipsPanel from './components/TipsPanel';
import logoUrl from './assets/logo.png';
import { formatDateDE, parseISODateLocal } from './utils/date';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const longDateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formatCurrency = (value) => currencyFormatter.format(value);
const formatPercent = (value) => `${value >= 0 ? '+' : ''}${percentFormatter.format(value)}%`;

const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Subs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.95.97-1.8 1.55-1.8 3.05" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Icon.Dashboard },
  { id: 'subscriptions', label: 'Abonnements', Icon: Icon.Subs },
  { id: 'analytics', label: 'Analytics', Icon: Icon.Analytics },
  { id: 'settings', label: 'Einstellungen', Icon: Icon.Settings },
];

const FILTER_OPTIONS = [
  { key: 'all', label: 'Alle' },
  { key: 'active', label: 'Aktiv' },
  { key: 'paused', label: 'Pausiert' },
  { key: 'cancelled', label: 'Gekündigt' },
];

export default function App() {
  const [subs, setSubs] = useState(initialSubscriptions);
  const [page, setPage] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const active = useMemo(() => subs.filter((sub) => sub.status === 'active'), [subs]);
  const paused = useMemo(() => subs.filter((sub) => sub.status === 'paused'), [subs]);
  const cancelled = useMemo(() => subs.filter((sub) => sub.status === 'cancelled'), [subs]);

  const monthlyTotal = useMemo(
    () => active.reduce((sum, sub) => sum + sub.cost, 0),
    [active],
  );

  const ytdSpend = useMemo(
    () => monthlyTotal * (new Date().getMonth() + 1),
    [monthlyTotal],
  );

  const avgPerSub = useMemo(
    () => (active.length ? monthlyTotal / active.length : 0),
    [active.length, monthlyTotal],
  );

  const yearlyProjection = useMemo(() => monthlyTotal * 12, [monthlyTotal]);

  const monthlyTrend = useMemo(() => {
    const latest = monthlyHistory[monthlyHistory.length - 1];
    const previous = monthlyHistory[monthlyHistory.length - 2] ?? latest;
    if (!latest || !previous || previous.amount === 0) return 0;
    return ((latest.amount - previous.amount) / previous.amount) * 100;
  }, []);

  const upcomingRenewal = useMemo(() => {
    return [...active]
      .sort((a, b) => parseISODateLocal(a.nextBilling) - parseISODateLocal(b.nextBilling))[0] ?? null;
  }, [active]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subs
      .filter((sub) => filter === 'all' || sub.status === filter)
      .filter((sub) => (query ? sub.name.toLowerCase().includes(query) : true));
  }, [subs, filter, search]);

  const pageMeta = NAV_ITEMS.find((item) => item.id === page) ?? NAV_ITEMS[0];

  const closeModal = useCallback(() => setModal(null), []);

  const handleSave = useCallback((sub) => {
    setSubs((prev) => {
      const exists = prev.some((entry) => entry.id === sub.id);
      return exists
        ? prev.map((entry) => (entry.id === sub.id ? sub : entry))
        : [...prev, sub];
    });
    setModal(null);
  }, []);

  const handleDelete = useCallback((id) => {
    const sub = subs.find((entry) => entry.id === id);
    if (!window.confirm(`Abo wirklich löschen${sub ? `: ${sub.name}` : ''}?`)) return;
    setSubs((prev) => prev.filter((entry) => entry.id !== id));
  }, [subs]);

  return (
    <div className="min-h-screen text-[color:var(--text-1)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col lg:flex-row">
        <aside
          className="w-full shrink-0 border-b lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:border-b-0 lg:border-r"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          <div className="flex h-full flex-col">
            <div
              className="flex items-center gap-3 px-6 py-6"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <img
                src={logoUrl}
                alt="SubTrack Logo"
                className="h-10 w-10 rounded-2xl object-cover ring-1 ring-white/10"
              />
              <div>
                <p className="text-base font-semibold tracking-tight text-[var(--text-1)]">SubTrack</p>
                <p className="mt-1 text-sm text-[var(--text-3)]">Subscription intelligence</p>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4" aria-label="Hauptnavigation">
              <div className="flex gap-2 overflow-x-auto lg:flex-col">
                {NAV_ITEMS.map((item) => {
                  const isActive = page === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="nav-item"
                      data-active={isActive}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setPage(item.id)}
                    >
                      <item.Icon />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="px-4 pb-4">
              <div className="panel-card panel-card--muted p-4">
                <p className="section-title">Monatlich gesamt</p>
                <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">
                  {formatCurrency(monthlyTotal)}
                </p>
                <p className="mt-3 text-sm text-[var(--text-3)]">
                  Prognose: {formatCurrency(yearlyProjection)} pro Jahr
                </p>
              </div>
            </div>

            <div
              className="flex flex-col gap-2 px-3 pb-4 pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {[
                { label: 'Support', Icon: Icon.Help },
                { label: 'Logout', Icon: Icon.Logout },
              ].map((item) => (
                <button key={item.label} type="button" className="nav-item">
                  <item.Icon />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header
            className="sticky top-0 z-20 border-b"
            style={{
              borderColor: 'var(--border)',
              background: 'rgba(9, 13, 11, 0.78)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex flex-col gap-4 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-title">SubTrack Dashboard</p>
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-1)]">
                  {pageMeta.label}
                </h1>
                <p className="mt-2 text-sm text-[var(--text-3)]">
                  {longDateFormatter.format(new Date())}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className="dashboard-icon-button" aria-label="Benachrichtigungen">
                  <Icon.Bell />
                  <span className="dashboard-notification-dot" />
                </button>

                <button
                  type="button"
                  onClick={() => setModal('new')}
                  className="dashboard-button"
                >
                  <Icon.Plus />
                  <span>Abo hinzufügen</span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-6 px-6 pb-8 pt-6 lg:px-8">
            {page === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  <KpiCard
                    label="Monatliche Kosten"
                    value={formatCurrency(monthlyTotal)}
                    sub={`${formatPercent(monthlyTrend)} vs. Vormonat`}
                    subAccent
                  />
                  <KpiCard
                    label="YTD Ausgaben"
                    value={formatCurrency(ytdSpend)}
                    sub={`${active.length} aktive Abos / ${paused.length} pausiert`}
                  />
                  <KpiCard
                    label="Ø pro Abo"
                    value={formatCurrency(avgPerSub)}
                    sub={`${cancelled.length} gekündigt / ${formatCurrency(yearlyProjection)} Jahresrunrate`}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="panel-card panel-card--interactive min-w-0 p-6 xl:col-span-2">
                    <LineChart data={monthlyHistory} />
                  </div>

                  <div className="panel-card panel-card--interactive flex flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="section-title">Jahreskosten Prognose</p>
                          <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">
                            {formatCurrency(yearlyProjection)}
                          </p>
                        </div>
                        <span className="dashboard-pill dashboard-pill--accent">
                          {formatPercent(monthlyTrend)}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[var(--text-3)]">
                        Basierend auf {active.length} aktiven Services und der aktuellen monatlichen
                        Burn-Rate.
                      </p>

                      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/80">
                        {[
                          { label: 'Aktive Abos', value: active.length, color: 'var(--accent)' },
                          { label: 'Pausierte Abos', value: paused.length, color: 'var(--warning)' },
                          { label: 'Gekündigte Abos', value: cancelled.length, color: 'var(--danger)' },
                        ].map((row, index, rows) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between px-4 py-4"
                            style={{
                              borderBottom: index < rows.length - 1 ? '1px solid var(--border)' : '0',
                            }}
                          >
                            <span className="text-sm text-[var(--text-3)]">{row.label}</span>
                            <span
                              className="text-sm font-semibold tabular-nums"
                              style={{ color: row.color }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                        <p className="text-xs uppercase tracking-widest text-[var(--text-3)]">
                          Nächste Verlängerung
                        </p>
                        <p className="mt-3 text-base font-semibold text-[var(--text-1)]">
                          {upcomingRenewal ? upcomingRenewal.name : 'Keine aktive Verlängerung'}
                        </p>
                        {upcomingRenewal && (
                          <p className="mt-2 text-sm text-[var(--text-3)]">
                            {formatDateDE(parseISODateLocal(upcomingRenewal.nextBilling), {
                              day: '2-digit',
                              month: 'short',
                            })}{' '}
                            / {formatCurrency(upcomingRenewal.cost)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPage('subscriptions')}
                        className="dashboard-button dashboard-button--secondary w-full justify-center"
                      >
                        Alle Abos ansehen
                      </button>
                    </div>
                  </div>
                </div>

                <div className="panel-card panel-card--interactive overflow-hidden p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="section-title">Aktive Abonnements</p>
                      <p className="text-sm text-[var(--text-3)]">
                        Die wichtigsten aktiven Services auf einen Blick.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage('subscriptions')}
                      className="text-sm font-medium text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
                    >
                      Alle anzeigen
                    </button>
                  </div>

                  <SubscriptionTable
                    subscriptions={active.slice(0, 5)}
                    onEdit={setModal}
                    onDelete={handleDelete}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <DonutChart subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <UpcomingBills subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <TipsPanel onAddSub={() => setModal('new')} />
                  </div>
                </div>
              </div>
            )}

            {page === 'subscriptions' && (
              <div className="flex flex-col gap-6">
                <div className="panel-card p-6">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="section-title">Abo-Verwaltung</p>
                      <p className="max-w-2xl text-sm leading-6 text-[var(--text-3)]">
                        Filtere dein Portfolio nach Status und suche gezielt nach einzelnen
                        Services, um Änderungen schneller durchzuführen.
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-4 xl:max-w-3xl">
                      <input
                        className="dashboard-input"
                        placeholder="Abonnements durchsuchen"
                        aria-label="Abonnements suchen"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        {FILTER_OPTIONS.map((option) => {
                          const isActive = filter === option.key;
                          return (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setFilter(option.key)}
                              className={`dashboard-filter ${isActive ? 'dashboard-filter--active' : ''}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                        <span className="text-sm text-[var(--text-3)]">
                          {filtered.length} Einträge
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card panel-card--interactive overflow-hidden p-6">
                  <div className="mb-4">
                    <p className="section-title">Alle Abonnements</p>
                    <p className="text-sm text-[var(--text-3)]">
                      Vollständige Übersicht über aktive, pausierte und gekündigte Abos.
                    </p>
                  </div>

                  <SubscriptionTable
                    subscriptions={filtered}
                    onEdit={setModal}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {page === 'analytics' && (
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="panel-card panel-card--interactive min-w-0 p-6 xl:col-span-2">
                  <LineChart data={monthlyHistory} />
                </div>
                <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                  <DonutChart subscriptions={subs} />
                </div>
                <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6 xl:col-span-3">
                  <UpcomingBills subscriptions={subs} />
                </div>
              </div>
            )}

            {page === 'settings' && (
              <div className="max-w-3xl">
                <div className="panel-card p-6">
                  <p className="section-title">Einstellungen</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-1)]">
                    Workspace-Konfiguration
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[var(--text-3)]">
                    Währung, Benachrichtigungen und Rollensteuerung können im nächsten Schritt
                    ergänzt werden. Die visuelle Basis für alle Panels und Eingaben ist jetzt
                    konsistent auf das Dashboard-System abgestimmt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {modal && (
          <SubscriptionModal
            key={modal === 'new' ? 'new' : modal.id}
            sub={modal === 'new' ? null : modal}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, subAccent = false }) {
  return (
    <div className="panel-card panel-card--interactive relative flex min-h-[120px] flex-col overflow-hidden p-6">
      <p className="section-title">{label}</p>
      <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">{value}</p>
      <p
        className="mt-4 text-sm leading-6"
        style={{ color: subAccent ? 'var(--accent)' : 'var(--text-3)' }}
      >
        {sub}
      </p>

      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(183, 243, 107, 0.16) 0%, transparent 72%)',
        }}
      />
    </div>
  );
}
