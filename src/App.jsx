import { useState, useMemo, useCallback } from 'react';
import { initialSubscriptions, monthlyHistory } from './data/subscriptions';
import DonutChart from './components/DonutChart';
import LineChart from './components/LineChart';
import UpcomingBills from './components/UpcomingBills';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';
import TipsPanel from './components/TipsPanel';
import logoUrl from './assets/logo.png';

/* ── Icons ─────────────────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Subs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     Icon: Icon.Dashboard },
  { id: 'subscriptions', label: 'Abonnements',   Icon: Icon.Subs },
  { id: 'analytics',     label: 'Analytik',      Icon: Icon.Analytics },
  { id: 'settings',      label: 'Einstellungen', Icon: Icon.Settings },
];

/* ── App ────────────────────────────────────────────────────── */
export default function App() {
  const [subs, setSubs]   = useState(initialSubscriptions);
  const [page, setPage]   = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const active    = useMemo(() => subs.filter(s => s.status === 'active'), [subs]);
  const paused    = useMemo(() => subs.filter(s => s.status === 'paused'), [subs]);
  const cancelled = useMemo(() => subs.filter(s => s.status === 'cancelled'), [subs]);
  const monthlyTotal = useMemo(() => active.reduce((sum, s) => sum + s.cost, 0), [active]);
  const ytdSpend  = monthlyTotal * (new Date().getMonth() + 1);
  const avgPerSub = active.length ? monthlyTotal / active.length : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subs
      .filter(s => filter === 'all' || s.status === filter)
      .filter(s => q ? s.name.toLowerCase().includes(q) : true);
  }, [subs, filter, search]);

  const closeModal = useCallback(() => setModal(null), []);

  const handleSave = useCallback((sub) => {
    setSubs(prev => {
      const exists = prev.some(s => s.id === sub.id);
      return exists ? prev.map(s => s.id === sub.id ? sub : s) : [...prev, sub];
    });
    setModal(null);
  }, []);

  const handleDelete = useCallback((id) => {
    const sub = subs.find(s => s.id === id);
    if (!window.confirm(`Abo wirklich löschen${sub ? `: ${sub.name}` : ''}?`)) return;
    setSubs(prev => prev.filter(s => s.id !== id));
  }, [subs]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="w-52 shrink-0 flex flex-col"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <img src={logoUrl} alt="SubTrack Logo" className="w-9 h-9 rounded-xl" />
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>SubTrack</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Abo-Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
                style={active
                  ? { background: 'rgba(163,230,53,0.12)', color: 'var(--accent)', border: '1px solid rgba(163,230,53,0.2)' }
                  : { color: 'var(--text-3)', border: '1px solid transparent' }
                }
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <item.Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Monthly total */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Monatlich gesamt</p>
            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{monthlyTotal.toFixed(2)}€</p>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-3 pb-4 flex flex-col gap-1">
          {[{ label: 'Support', icon: '?' }, { label: 'Logout', icon: '→' }].map(item => (
            <button
              key={item.label}
              type="button"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors w-full text-left"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between backdrop-blur-sm"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(13,20,16,0.9)' }}
        >
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
            >
              <Icon.Bell />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
              />
            </button>
            <button
              type="button"
              onClick={() => setModal('new')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #a3e635, #6bbf1c)',
                color: '#0d1410',
                boxShadow: '0 0 16px rgba(163,230,53,0.25)',
              }}
            >
              <Icon.Plus />
              Abo hinzufügen
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* ── Dashboard ──────────────────────────────────── */}
          {page === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Monatliche Gesamtkosten" value={`${monthlyTotal.toFixed(2)}€`} sub="+5.2% ggü. Vormonat" subAccent trend="up" />
                <KpiCard label="YTD Ausgaben" value={`${ytdSpend.toFixed(2)}€`} sub={`${active.length} aktive Abos`} />
                <KpiCard label="Ø pro Abo" value={`${avgPerSub.toFixed(2)}€`} sub={`${paused.length} pausiert · ${cancelled.length} gekündigt`} />
              </div>

              {/* Chart row: Line chart (2/3) + Total panel (1/3) */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="col-span-2 rounded-2xl p-6"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <LineChart data={monthlyHistory} />
                </div>
                <div
                  className="rounded-2xl p-5 flex flex-col gap-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {/* Total balance widget */}
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-3)' }}>Jahreskosten Prognose</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                        {(monthlyTotal * 12).toFixed(2)}€
                      </p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(163,230,53,0.12)', color: 'var(--accent)' }}>
                        ↑ +5.2%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Aktive Abos',     value: active.length,    color: 'var(--accent)' },
                      { label: 'Pausierte Abos',  value: paused.length,    color: '#fbbf24' },
                      { label: 'Gekündigte Abos', value: cancelled.length, color: '#f87171' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{row.label}</span>
                        <span className="text-sm font-bold tabular-nums" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage('subscriptions')}
                    className="mt-auto w-full py-2 rounded-xl text-xs font-medium transition-colors"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  >
                    Alle Abos ansehen →
                  </button>
                </div>
              </div>

              {/* Subscription table */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--accent)' }}>
                    Aktive Abonnements
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage('subscriptions')}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    Alle anzeigen →
                  </button>
                </div>
                <SubscriptionTable
                  subscriptions={active.slice(0, 5)}
                  onEdit={setModal}
                  onDelete={handleDelete}
                />
              </div>

              {/* Bottom row: Donut + Upcoming + Tips */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <DonutChart subscriptions={subs} />
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <UpcomingBills subscriptions={subs} />
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <TipsPanel onAddSub={() => setModal('new')} />
                </div>
              </div>
            </div>
          )}

          {/* ── Subscriptions ──────────────────────────────── */}
          {page === 'subscriptions' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  className="flex-1 max-w-xs px-4 py-2 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-1)',
                  }}
                  placeholder="Suchen..."
                  aria-label="Abonnements suchen"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Alle' },
                    { key: 'active', label: 'Aktiv' },
                    { key: 'paused', label: 'Pausiert' },
                    { key: 'cancelled', label: 'Gekündigt' },
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
                      style={filter === f.key
                        ? { background: 'rgba(163,230,53,0.12)', color: 'var(--accent)', border: '1px solid rgba(163,230,53,0.3)' }
                        : { background: 'var(--surface)', color: 'var(--text-3)', border: '1px solid var(--border)' }
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{filtered.length} Einträge</span>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <SubscriptionTable subscriptions={filtered} onEdit={setModal} onDelete={handleDelete} />
              </div>
            </div>
          )}

          {/* ── Analytics ──────────────────────────────────── */}
          {page === 'analytics' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <LineChart data={monthlyHistory} />
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <DonutChart subscriptions={subs} />
              </div>
              <div className="col-span-3 rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <UpcomingBills subscriptions={subs} />
              </div>
            </div>
          )}

          {/* ── Settings ───────────────────────────────────── */}
          {page === 'settings' && (
            <div className="max-w-lg">
              <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-1)' }}>Einstellungen</h2>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Währung, Benachrichtigungen und weitere Optionen kommen bald.</p>
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
  );
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ label, value, sub, subAccent, trend }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--text-3)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
      <p className="text-xs mt-1.5" style={{ color: subAccent ? 'var(--accent)' : 'var(--text-3)' }}>
        {trend === 'up' ? '↑ ' : ''}{sub}
      </p>
      {/* Subtle accent glow in corner */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)' }}
      />
    </div>
  );
}
