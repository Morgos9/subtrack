import { useState, useMemo, useCallback } from 'react';
import { initialSubscriptions, monthlyHistory } from './data/subscriptions';
import DonutChart from './components/DonutChart';
import BarChart from './components/BarChart';
import UpcomingBills from './components/UpcomingBills';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'subscriptions', label: 'Abonnements', icon: '📋' },
  { id: 'analytics', label: 'Analytik', icon: '📈' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
];

export default function App() {
  const [subs, setSubs] = useState(initialSubscriptions);
  const [page, setPage] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const closeModal = useCallback(() => setModal(null), []);

  const active = useMemo(() => subs.filter(s => s.status === 'active'), [subs]);
  const paused = useMemo(() => subs.filter(s => s.status === 'paused'), [subs]);
  const cancelled = useMemo(() => subs.filter(s => s.status === 'cancelled'), [subs]);
  const monthlyTotal = useMemo(() => active.reduce((sum, s) => sum + s.cost, 0), [active]);
  const ytdMonths = new Date().getMonth() + 1;
  const ytdSpend = monthlyTotal * ytdMonths;
  const avgPerSub = active.length ? monthlyTotal / active.length : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subs
      .filter(s => filter === 'all' || s.status === filter)
      .filter(s => (q ? s.name.toLowerCase().includes(q) : true));
  }, [subs, filter, search]);

  const handleSave = useCallback((sub) => {
    setSubs(prev => {
      const exists = prev.some(s => s.id === sub.id);
      return exists ? prev.map(s => (s.id === sub.id ? sub : s)) : [...prev, sub];
    });
    setModal(null);
  }, []);

  const handleDelete = useCallback((id) => {
    const sub = subs.find(s => s.id === id);
    const ok = window.confirm(`Abo wirklich löschen${sub ? `: ${sub.name}` : ''}?`);
    if (!ok) return;
    setSubs(prev => prev.filter(s => s.id !== id));
  }, [subs]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-lg font-bold text-white tracking-tight">💳 SubTrack</h1>
          <p className="text-xs text-slate-500 mt-0.5">Abo-Manager</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                page === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Monatlich gesamt</p>
            <p className="text-xl font-bold text-amber-400">{monthlyTotal.toFixed(2)}€</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {NAV_ITEMS.find(n => n.id === page)?.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/30"
          >
            + Abo hinzufügen
          </button>
        </header>

        <div className="p-8">
          {page === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard
                  label="Monatliche Gesamtkosten"
                  value={`${monthlyTotal.toFixed(2)}€`}
                  sub="+5.2% ggü. Vormonat"
                  subColor="text-emerald-400"
                  icon="💰"
                  accent="from-blue-600/20 to-blue-800/10"
                />
                <KpiCard
                  label="YTD Ausgaben"
                  value={`${ytdSpend.toFixed(2)}€`}
                  sub={`${active.length} aktive Abos`}
                  subColor="text-slate-400"
                  icon="📅"
                  accent="from-amber-600/20 to-amber-800/10"
                />
                <KpiCard
                  label="Ø pro Abo"
                  value={`${avgPerSub.toFixed(2)}€`}
                  sub={`${paused.length} pausiert · ${cancelled.length} gekündigt`}
                  subColor="text-slate-400"
                  icon="📊"
                  accent="from-purple-600/20 to-purple-800/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 bg-slate-800 border border-slate-700 rounded-2xl p-5">
                  <DonutChart subscriptions={subs} />
                </div>
                <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col gap-6">
                  <BarChart data={monthlyHistory} />
                  <UpcomingBills subscriptions={subs} />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Aktive Abonnements</h2>
                  <button
                    type="button"
                    onClick={() => setPage('subscriptions')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                    aria-label="Zur Abonnements-Übersicht wechseln"
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
            </div>
          )}

          {page === 'subscriptions' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <input
                  className="flex-1 max-w-xs bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Suchen..."
                  aria-label="Abonnements suchen"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="flex gap-2">
                  {['all', 'active', 'paused', 'cancelled'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        filter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                      }`}
                    >
                      {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : f === 'paused' ? 'Pausiert' : 'Gekündigt'}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">{filtered.length} Einträge</span>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <SubscriptionTable
                  subscriptions={filtered}
                  onEdit={setModal}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          )}

          {page === 'analytics' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <DonutChart subscriptions={subs} />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <BarChart data={monthlyHistory} />
              </div>
              <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <UpcomingBills subscriptions={subs} />
              </div>
            </div>
          )}

          {page === 'settings' && (
            <div className="max-w-lg">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-slate-200 mb-4">Einstellungen</h2>
                <p className="text-sm text-slate-400">Währung, Benachrichtigungen und weitere Optionen kommen bald.</p>
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

function KpiCard({ label, value, sub, subColor, icon, accent }) {
  return (
    <div className={`bg-gradient-to-br ${accent} border border-slate-700 rounded-2xl p-5 relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          <p className={`text-xs mt-1.5 ${subColor}`}>{sub}</p>
        </div>
        <span className="text-3xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}
