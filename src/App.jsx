import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import DonutChart from './components/DonutChart';
import LineChart from './components/LineChart';
import UpcomingBills from './components/UpcomingBills';
import SubscriptionTable from './components/SubscriptionTable';
import SubscriptionModal from './components/SubscriptionModal';
import TipsPanel from './components/TipsPanel';
import UserWorkspacePanel from './components/UserWorkspacePanel';
import logoUrl from './assets/logo.png';
import {
  addDays,
  formatDateDE,
  parseISODateLocal,
  startOfDay,
} from './utils/date';
import { createUserRecord, loadWorkspace, persistWorkspace } from './utils/workspaceStore';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];
const CURRENCY_STORAGE_KEY = 'subtrack-currency';

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

const shortDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
});

const formatPercent = (value) => `${value >= 0 ? '+' : ''}${percentFormatter.format(value)}%`;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

const THEMES = [
  {
    id: 'forest',
    label: 'Forest',
    accent: '#b7f36b',
    bg: '#070b09',
    description: 'Natürlicher Neon-Kontrast mit ruhiger, fokussierter Oberfläche.',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    accent: '#38bdf8',
    bg: '#070a10',
    description: 'Klares Blau für analytische Ansichten mit viel Tiefenwirkung.',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    accent: '#c084fc',
    bg: '#0c080f',
    description: 'Sanftes Zwielicht mit editorialer, leicht dramatischer Stimmung.',
  },
  {
    id: 'ember',
    label: 'Ember',
    accent: '#fb923c',
    bg: '#0f0a06',
    description: 'Warme High-Energy-Variante für eine lebendige Arbeitsfläche.',
  },
  {
    id: 'rose',
    label: 'Rose',
    accent: '#f472b6',
    bg: '#0f070a',
    description: 'Weiches, elegantes Preset mit stärkerem Kontrast in Panels.',
  },
];

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
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9h18" />
    </svg>
  ),
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H5a2 2 0 0 1 0-4h13" />
      <path d="M3 7h17a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M17 13h.01" />
    </svg>
  ),
  Trend: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  Layer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 4.5-9 4.5L3 7.5 12 3Z" />
      <path d="m3 12.5 9 4.5 9-4.5" />
      <path d="m3 17 9 4.5 9-4.5" />
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

const CHART_RANGES = [
  { key: '3m', label: '3M', size: 3 },
  { key: '6m', label: '6M', size: 6 },
  { key: 'all', label: 'Alle', size: Number.POSITIVE_INFINITY },
];

const PAGE_META = {
  dashboard: {
    eyebrow: 'Portfolio cockpit',
    description:
      'Kosten, Renewal-Druck und direkte Sparchancen in einer fokussierten Oberfläche.',
  },
  subscriptions: {
    eyebrow: 'Portfolio management',
    description:
      'Services durchsuchen, priorisieren und schneller pflegen, ohne den Überblick zu verlieren.',
  },
  analytics: {
    eyebrow: 'Spend analytics',
    description:
      'Verstehe Bewegungen im Portfolio, erkenne Kostentreiber und plane kommende Zahlungen besser.',
  },
  settings: {
    eyebrow: 'Experience controls',
    description:
      'Passe die visuelle Sprache von SubTrack an und halte dein Workspace-Setup konsistent.',
  },
};

const EMPTY_SUBSCRIPTIONS = [];
const EMPTY_HISTORY = [];

function resolvePageFromHash() {
  if (typeof window === 'undefined') return 'dashboard';

  const candidate = window.location.hash.replace(/^#/, '').trim();
  return NAV_ITEMS.some((item) => item.id === candidate) ? candidate : 'dashboard';
}

export default function App() {
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const [page, setPage] = useState(() => resolvePageFromHash());
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [chartRange, setChartRange] = useState('6m');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [currency, setCurrency] = useState(() => {
    if (typeof window === 'undefined') return 'EUR';
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return CURRENCIES.includes(stored) ? stored : 'EUR';
  });

  const formatCurrency = useMemo(
    () => {
      const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return (value) => formatter.format(value);
    },
    [currency],
  );

  const activeUser = useMemo(
    () => workspace.users.find((user) => user.id === workspace.activeUserId) ?? workspace.users[0],
    [workspace],
  );
  const subs = activeUser?.subscriptions ?? EMPTY_SUBSCRIPTIONS;
  const userHistory = activeUser?.monthlyHistory ?? EMPTY_HISTORY;
  const theme = activeUser?.theme ?? THEMES[0].id;

  const deferredSearch = useDeferredValue(search);
  const today = useMemo(() => startOfDay(new Date()), []);
  const next7Days = useMemo(() => addDays(today, 7), [today]);
  const next30Days = useMemo(() => addDays(today, 30), [today]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    persistWorkspace(workspace);
  }, [workspace]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = resolvePageFromHash();
      startTransition(() => setPage(nextPage));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nextHash = `#${page}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [page]);

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

  const visibleHistory = useMemo(() => {
    const selectedRange = CHART_RANGES.find((option) => option.key === chartRange) ?? CHART_RANGES[1];
    return Number.isFinite(selectedRange.size)
      ? userHistory.slice(-selectedRange.size)
      : userHistory;
  }, [chartRange, userHistory]);

  const monthlyTrend = useMemo(() => {
    const latest = visibleHistory[visibleHistory.length - 1];
    const previous = visibleHistory[visibleHistory.length - 2] ?? latest;
    if (!latest || !previous || previous.amount === 0) return 0;
    return ((latest.amount - previous.amount) / previous.amount) * 100;
  }, [visibleHistory]);

  const historyWindowLabel = useMemo(() => {
    if (!visibleHistory.length) return 'Keine Daten';
    const firstMonth = visibleHistory[0].month;
    const lastMonth = visibleHistory[visibleHistory.length - 1].month;
    return firstMonth === lastMonth ? firstMonth : `${firstMonth} bis ${lastMonth}`;
  }, [visibleHistory]);

  const upcomingActive = useMemo(() => {
    return active
      .map((sub) => ({ ...sub, date: parseISODateLocal(sub.nextBilling) }))
      .filter((sub) => sub.date)
      .sort((a, b) => a.date - b.date);
  }, [active]);

  const upcomingRenewal = upcomingActive[0] ?? null;

  const renewalsInWindow = useMemo(() => {
    return upcomingActive.filter((sub) => sub.date >= today && sub.date <= next30Days);
  }, [next30Days, today, upcomingActive]);

  const plannedSpend30Days = useMemo(
    () => renewalsInWindow.reduce((sum, sub) => sum + sub.cost, 0),
    [renewalsInWindow],
  );

  const dueSoonCount = useMemo(
    () => renewalsInWindow.filter((sub) => sub.date <= next7Days).length,
    [next7Days, renewalsInWindow],
  );

  const largestSubscription = useMemo(() => {
    return active.reduce(
      (largest, sub) => (!largest || sub.cost > largest.cost ? sub : largest),
      null,
    );
  }, [active]);

  const topCategory = useMemo(() => {
    const totals = active.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] ?? 0) + sub.cost;
      return acc;
    }, {});

    const [category, amount] =
      Object.entries(totals).sort((left, right) => right[1] - left[1])[0] ?? [];

    if (!category || typeof amount !== 'number') return null;

    return {
      category,
      amount,
      ratio: monthlyTotal ? amount / monthlyTotal : 0,
    };
  }, [active, monthlyTotal]);

  const pausedPotential = useMemo(
    () => paused.reduce((sum, sub) => sum + sub.cost, 0),
    [paused],
  );

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return subs
      .filter((sub) => filter === 'all' || sub.status === filter)
      .filter((sub) => (query ? sub.name.toLowerCase().includes(query) : true));
  }, [deferredSearch, filter, subs]);

  const pageLabel = NAV_ITEMS.find((item) => item.id === page)?.label ?? 'Dashboard';
  const pageMeta = PAGE_META[page] ?? PAGE_META.dashboard;
  const themeMeta = THEMES.find((preset) => preset.id === theme) ?? THEMES[0];
  const activeThemeRgb = hexToRgb(themeMeta.accent);
  const focusHeadline =
    monthlyTrend <= 0 ? 'Kosten unter Kontrolle' : monthlyTrend > 4 ? 'Kostenanstieg beobachten' : 'Portfolio bleibt stabil';

  const dashboardFocusItems = [
    {
      label: 'Nächste Verlängerung',
      value: upcomingRenewal ? upcomingRenewal.name : 'Keine geplant',
      meta: upcomingRenewal
        ? `${shortDateFormatter.format(upcomingRenewal.date)} · ${formatCurrency(upcomingRenewal.cost)}`
        : 'Aktuell keine aktive Abbuchung im Kalender.',
    },
    {
      label: 'Größter Kostentreiber',
      value: largestSubscription ? largestSubscription.name : 'Keine Daten',
      meta: largestSubscription
        ? `${formatCurrency(largestSubscription.cost)} pro Monat`
        : 'Lege ein aktives Abo an, um Prioritäten zu sehen.',
    },
    {
      label: 'Sofortiges Potenzial',
      value: formatCurrency(pausedPotential ?? 0),
      meta: paused.length
        ? `${paused.length} pausierte Services warten auf eine Entscheidung.`
        : 'Derzeit keine pausierten Services im Portfolio.',
    },
  ];

  const closeModal = useCallback(() => setModal(null), []);

  const openNewModal = useCallback(() => {
    startTransition(() => setModal('new'));
  }, []);

  const openEditModal = useCallback((sub) => {
    startTransition(() => setModal(sub));
  }, []);

  const updateActiveUser = useCallback((updater) => {
    setWorkspace((current) => ({
      ...current,
      users: current.users.map((user) => (
        user.id === current.activeUserId ? updater(user) : user
      )),
    }));
  }, []);

  const handlePageChange = useCallback((nextPage) => {
    startTransition(() => {
      setPage(nextPage);
      setMobileNavOpen(false);
    });
  }, []);

  const handleThemeChange = useCallback((nextTheme) => {
    updateActiveUser((user) => ({
      ...user,
      theme: nextTheme,
    }));
  }, [updateActiveUser]);

  const handleCurrencyChange = useCallback((nextCurrency) => {
    if (!CURRENCIES.includes(nextCurrency)) return;
    setCurrency(nextCurrency);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
    }
  }, []);

  const handleCreateUser = useCallback((event) => {
    event.preventDefault();

    const name = newUserName.trim();
    if (!name) return;

    const nextUser = createUserRecord({
      name,
      theme,
      subscriptions: [],
      history: [],
    });

    startTransition(() => {
      setWorkspace((current) => ({
        ...current,
        activeUserId: nextUser.id,
        users: [...current.users, nextUser],
      }));
      setNewUserName('');
      setFilter('all');
      setSearch('');
      setChartRange('6m');
      setModal(null);
      setPage('settings');
    });
  }, [newUserName, theme]);

  const handleSelectUser = useCallback((userId) => {
    if (userId === activeUser.id) return;

    startTransition(() => {
      setWorkspace((current) => ({
        ...current,
        activeUserId: userId,
      }));
      setFilter('all');
      setSearch('');
      setChartRange('6m');
      setModal(null);
    });
  }, [activeUser.id]);

  const handleDeleteUser = useCallback((userId) => {
    const user = workspace.users.find((entry) => entry.id === userId);
    if (!user) return;

    if (workspace.users.length === 1) {
      window.alert('Mindestens ein Nutzer muss erhalten bleiben.');
      return;
    }

    if (!window.confirm(`Nutzer wirklich loeschen: ${user.name}?`)) return;

    startTransition(() => {
      setWorkspace((current) => {
        const nextUsers = current.users.filter((entry) => entry.id !== userId);
        return {
          ...current,
          activeUserId:
            current.activeUserId === userId
              ? nextUsers[0]?.id ?? current.activeUserId
              : current.activeUserId,
          users: nextUsers,
        };
      });
      setFilter('all');
      setSearch('');
      setChartRange('6m');
      setModal(null);
    });
  }, [workspace.users]);

  const handleSave = useCallback((sub) => {
    updateActiveUser((user) => {
      const exists = user.subscriptions.some((entry) => entry.id === sub.id);
      return {
        ...user,
        subscriptions: exists
          ? user.subscriptions.map((entry) => (entry.id === sub.id ? sub : entry))
          : [...user.subscriptions, sub],
      };
    });
    setModal(null);
  }, [updateActiveUser]);

  const handleDelete = useCallback((id) => {
    const sub = subs.find((entry) => entry.id === id);
    if (!window.confirm(`Abo wirklich löschen${sub ? `: ${sub.name}` : ''}?`)) return;

    updateActiveUser((user) => ({
      ...user,
      subscriptions: user.subscriptions.filter((entry) => entry.id !== id),
    }));
  }, [subs, updateActiveUser]);

  return (
    <div className="min-h-screen text-[color:var(--text-1)]">
      <div
        className={`mobile-nav-backdrop ${mobileNavOpen ? 'is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside
          className={`dashboard-sidebar ${mobileNavOpen ? 'is-open' : ''}`}
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          <div className="flex h-full flex-col">
            <div
              className="flex items-center justify-between gap-3 px-5 py-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={logoUrl}
                  alt="SubTrack Logo"
                  className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight text-[var(--text-1)]">SubTrack</p>
                  <p className="mt-1 text-sm text-[var(--text-3)]">Subscription intelligence</p>
                </div>
              </div>

              <button
                type="button"
                className="dashboard-icon-button lg:hidden"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Navigation schließen"
              >
                <Icon.Close />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4" aria-label="Hauptnavigation">
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = page === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="nav-item"
                      data-active={isActive}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => handlePageChange(item.id)}
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
                <p className="section-title">Portfolio live</p>
                <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">
                  {formatCurrency(monthlyTotal)}
                </p>
                <p className="mt-3 text-sm text-[var(--text-3)]">
                  {active.length} aktive Services · {activeUser.name}
                </p>
              </div>
            </div>

            <div className="px-4 pb-5">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-2)]/80 p-4">
                <p className="section-title">Fokus</p>
                <div className="space-y-3">
                  <SidebarStat
                    label="Nächste Verlängerung"
                    value={upcomingRenewal ? upcomingRenewal.name : 'Keine geplant'}
                    meta={
                      upcomingRenewal
                        ? `${shortDateFormatter.format(upcomingRenewal.date)} · ${formatCurrency(upcomingRenewal.cost)}`
                        : 'Keine aktive Abbuchung'
                    }
                  />
                  <SidebarStat
                    label="Top-Kategorie"
                    value={topCategory ? topCategory.category : 'Noch offen'}
                    meta={
                      topCategory
                        ? `${formatCurrency(topCategory.amount)} · ${percentFormatter.format(topCategory.ratio * 100)}%`
                        : 'Sobald aktive Services vorliegen.'
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className="mt-auto flex flex-col gap-2 px-3 pb-4 pt-2"
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
              background: 'var(--header-bg)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            }}
          >
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="dashboard-icon-button lg:hidden"
                      onClick={() => setMobileNavOpen(true)}
                      aria-label="Navigation öffnen"
                      aria-expanded={mobileNavOpen}
                    >
                      <Icon.Menu />
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <p className="section-title mb-0">{pageMeta.eyebrow}</p>
                      <span className="dashboard-pill hidden sm:inline-flex">{themeMeta.label}</span>
                      <span className="dashboard-pill hidden md:inline-flex">{activeUser.name}</span>
                    </div>
                  </div>

                  <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-1)] sm:text-3xl lg:text-4xl">
                    {pageLabel}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-3)]">
                    {pageMeta.description}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <button type="button" className="dashboard-icon-button" aria-label="Benachrichtigungen">
                  <Icon.Bell />
                  <span className="dashboard-notification-dot" />
                </button>

                <button
                  type="button"
                  onClick={openNewModal}
                  className="dashboard-button"
                >
                  <Icon.Plus />
                  <span>Abo hinzufügen</span>
                </button>
              </div>
            </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[var(--text-3)]">
                  {longDateFormatter.format(new Date())}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="dashboard-pill">Nutzer: {activeUser.name}</span>
                  {page === 'dashboard' && (
                    <span className="dashboard-pill dashboard-pill--accent">
                      {formatCurrency(monthlyTotal)} / Monat
                    </span>
                  )}
                  {page === 'subscriptions' && (
                    <span className="dashboard-pill">{filtered.length} Einträge sichtbar</span>
                  )}
                  {page === 'analytics' && (
                    <span className="dashboard-pill">Zeitraum: {historyWindowLabel}</span>
                  )}
                  {page === 'settings' && (
                    <span className="dashboard-pill">Aktives Preset: {themeMeta.label}</span>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            {page === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <section className="hero-panel panel-card overflow-hidden p-6 lg:p-8">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
                    style={{
                      background: `radial-gradient(circle, rgba(${activeThemeRgb}, 0.22) 0%, transparent 70%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full blur-3xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 75%)',
                    }}
                  />

                  <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="dashboard-pill dashboard-pill--accent">Live Portfolio</span>
                        <span className="dashboard-pill">{active.length} aktive Services</span>
                        <span className="dashboard-pill">{dueSoonCount} fällig in 7 Tagen</span>
                      </div>

                      <div>
                        <p className="section-title">Spending cockpit</p>
                        <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.06em] text-[var(--text-1)] sm:text-3xl xl:text-[2.8rem]">
                          Subscription intelligence mit klarem Fokus statt bloßer Zahlenwand.
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-2)]">
                          SubTrack bündelt aktuelle Runrate, nächste Abbuchungen und direkte Sparhebel
                          in einem Dashboard, das auf schnelle Entscheidungen ausgelegt ist.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <HeroStat
                          label="Monatliche Runrate"
                          value={formatCurrency(monthlyTotal)}
                          meta={`${active.length} aktive Abos`}
                          icon={<Icon.Wallet />}
                          accent
                        />
                        <HeroStat
                          label="Nächste 30 Tage"
                          value={formatCurrency(plannedSpend30Days)}
                          meta={`${renewalsInWindow.length} geplante Abbuchungen`}
                          icon={<Icon.Calendar />}
                        />
                        <HeroStat
                          label="Top-Kategorie"
                          value={topCategory ? topCategory.category : 'Noch offen'}
                          meta={
                            topCategory
                              ? `${percentFormatter.format(topCategory.ratio * 100)}% Anteil`
                              : 'Sobald aktive Abos vorhanden sind'
                          }
                          icon={<Icon.Layer />}
                        />
                        <HeroStat
                          label="Pausen-Potenzial"
                          value={formatCurrency(pausedPotential ?? 0)}
                          meta={
                            paused.length
                              ? `${paused.length} pausierte Services`
                              : 'Aktuell keine pausierten Abos'
                          }
                          icon={<Icon.Trend />}
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={openNewModal} className="dashboard-button">
                          <Icon.Plus />
                          <span>Abo hinzufügen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePageChange('subscriptions')}
                          className="dashboard-button dashboard-button--secondary"
                        >
                          <span>Portfolio verwalten</span>
                          <Icon.ArrowRight />
                        </button>
                      </div>
                    </div>

                    <div className="panel-card panel-card--muted flex flex-col gap-5 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="section-title">Fokus heute</p>
                          <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-1)]">
                            {focusHeadline}
                          </h3>
                        </div>
                        <span className={`dashboard-pill ${monthlyTrend >= 0 ? 'dashboard-pill--accent' : ''}`}>
                          {formatPercent(monthlyTrend)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {dashboardFocusItems.map((item) => (
                          <div key={item.label} className="focus-list-row">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-4)]">
                                {item.label}
                              </p>
                              <p className="mt-2 text-base font-semibold text-[var(--text-1)]">
                                {item.value}
                              </p>
                            </div>
                            <p className="max-w-[14rem] text-right text-sm leading-6 text-[var(--text-3)]">
                              {item.meta}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Theme</p>
                          <p className="mt-3 text-lg font-semibold text-[var(--text-1)]">{themeMeta.label}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{themeMeta.description}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Jahresprojektion</p>
                          <p className="mt-3 text-lg font-semibold text-[var(--text-1)]">
                            {formatCurrency(yearlyProjection)}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">
                            Bei unveränderter Runrate über die nächsten 12 Monate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="YTD Ausgaben"
                    value={formatCurrency(ytdSpend)}
                    sub={`${active.length} aktive / ${paused.length} pausiert`}
                  />
                  <KpiCard
                    label="Ø pro aktivem Abo"
                    value={formatCurrency(avgPerSub)}
                    sub={`${cancelled.length} gekündigt im Portfolio`}
                  />
                  <KpiCard
                    label="Trend zum Vormonat"
                    value={formatPercent(monthlyTrend)}
                    sub="Basierend auf dem aktuell gewählten Analysefenster."
                    subAccent={monthlyTrend >= 0}
                  />
                  <KpiCard
                    label="Renewal-Druck"
                    value={`${dueSoonCount}`}
                    sub={`${formatCurrency(plannedSpend30Days)} in den nächsten 30 Tagen`}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
                  <div className="panel-card panel-card--interactive min-w-0 p-6">
                    <LineChart
                      data={visibleHistory}
                      range={chartRange}
                      onRangeChange={setChartRange}
                      rangeOptions={CHART_RANGES}
                    />
                  </div>

                  <div className="panel-card panel-card--interactive flex flex-col gap-6 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="section-title">Renewal Radar</p>
                        <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text-1)]">
                          {formatCurrency(plannedSpend30Days)}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-3)]">
                          Geplante Abbuchungen in den nächsten 30 Tagen auf Basis aktiver Services.
                        </p>
                      </div>
                      <span className="dashboard-pill">{renewalsInWindow.length} geplant</span>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/80">
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
                          <span className="text-sm font-semibold tabular-nums" style={{ color: row.color }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Nächste Verlängerung</p>
                      <p className="mt-3 text-base font-semibold text-[var(--text-1)]">
                        {upcomingRenewal ? upcomingRenewal.name : 'Keine aktive Verlängerung'}
                      </p>
                      {upcomingRenewal && (
                        <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">
                          {formatDateDE(upcomingRenewal.date, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {formatCurrency(upcomingRenewal.cost)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePageChange('subscriptions')}
                      className="dashboard-button dashboard-button--secondary w-full justify-center"
                    >
                      <span>Zur Abo-Verwaltung</span>
                      <Icon.ArrowRight />
                    </button>
                  </div>
                </div>

                <div className="panel-card panel-card--interactive overflow-hidden p-6">
                  <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="section-title">Aktive Abonnements</p>
                      <p className="text-sm text-[var(--text-3)]">
                        Die wichtigsten laufenden Services mit direktem Zugriff auf Bearbeitung und
                        Verwaltung.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePageChange('subscriptions')}
                      className="dashboard-button dashboard-button--secondary"
                    >
                      <span>Alle ansehen</span>
                      <Icon.ArrowRight />
                    </button>
                  </div>

                  <SubscriptionTable
                    subscriptions={active.slice(0, 5)}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <DonutChart subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <UpcomingBills subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6 md:col-span-2 xl:col-span-1">
                    <TipsPanel onAddSub={openNewModal} />
                  </div>
                </div>
              </div>
            )}

            {page === 'subscriptions' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <KpiCard
                    label="Aktive Kosten"
                    value={formatCurrency(monthlyTotal)}
                    sub={`${active.length} aktive Services`}
                  />
                  <KpiCard
                    label="Suchtreffer"
                    value={`${filtered.length}`}
                    sub={
                      deferredSearch
                        ? `Gefiltert nach „${deferredSearch.trim()}“`
                        : 'Alle Services im aktuellen Filter'
                    }
                  />
                  <KpiCard
                    label="Nächste Abbuchung"
                    value={upcomingRenewal ? upcomingRenewal.name : 'Keine'}
                    sub={
                      upcomingRenewal
                        ? `${shortDateFormatter.format(upcomingRenewal.date)} · ${formatCurrency(upcomingRenewal.cost)}`
                        : 'Keine aktive Verlängerung geplant'
                    }
                  />
                </div>

                <div className="panel-card p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="section-title">Abo-Verwaltung</p>
                        <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                          Portfolio mit weniger Reibung pflegen.
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-3)]">
                          Suche, Statusfilter und klare Aktionsflächen bringen dich schneller von der
                          Analyse zur Änderung.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="dashboard-pill dashboard-pill--accent">{active.length} aktiv</span>
                        <span className="dashboard-pill">{paused.length} pausiert</span>
                        <span className="dashboard-pill">{cancelled.length} gekündigt</span>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                      <label className="dashboard-search-shell">
                        <Icon.Search />
                        <input
                          className="dashboard-input dashboard-input--ghost"
                          placeholder="Abonnements durchsuchen"
                          aria-label="Abonnements suchen"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        {FILTER_OPTIONS.map((option) => {
                          const isActive = filter === option.key;
                          return (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setFilter(option.key)}
                              aria-pressed={isActive}
                              className={`dashboard-filter ${isActive ? 'dashboard-filter--active' : ''}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-3)]">
                      <span>{filtered.length} Einträge sichtbar</span>
                      {deferredSearch.trim() && (
                        <span className="dashboard-pill">Suche: {deferredSearch.trim()}</span>
                      )}
                      {filter !== 'all' && (
                        <span className="dashboard-pill">Status: {filter}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="panel-card panel-card--interactive overflow-hidden p-4 sm:p-6">
                  <div className="mb-5">
                    <p className="section-title">Alle Abonnements</p>
                    <p className="text-sm text-[var(--text-3)]">
                      Vollständige Übersicht über aktive, pausierte und gekündigte Services inklusive
                      schneller Aktionen.
                    </p>
                  </div>

                  <SubscriptionTable
                    subscriptions={filtered}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            )}

            {page === 'analytics' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <KpiCard
                    label="Analysefenster"
                    value={historyWindowLabel}
                    sub={`${visibleHistory.length} Datenpunkte sichtbar`}
                  />
                  <KpiCard
                    label="Top-Kategorie"
                    value={topCategory ? topCategory.category : 'Noch offen'}
                    sub={
                      topCategory
                        ? `${formatCurrency(topCategory.amount)} im Monat`
                        : 'Sobald aktive Abos vorhanden sind'
                    }
                  />
                  <KpiCard
                    label="Größter Kostentreiber"
                    value={largestSubscription ? largestSubscription.name : 'Keine Daten'}
                    sub={
                      largestSubscription
                        ? `${formatCurrency(largestSubscription.cost)} pro Monat`
                        : 'Lege ein aktives Abo an'
                    }
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
                  <div className="panel-card panel-card--interactive min-w-0 p-6">
                    <LineChart
                      data={visibleHistory}
                      range={chartRange}
                      onRangeChange={setChartRange}
                      rangeOptions={CHART_RANGES}
                    />
                  </div>
                  <div className="panel-card panel-card--interactive flex flex-col gap-4 p-6">
                    <div>
                      <p className="section-title">Analyse-Insights</p>
                      <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                        Was im Portfolio gerade zählt.
                      </h2>
                    </div>

                    {[
                      {
                        label: 'Trend',
                        value: formatPercent(monthlyTrend),
                        meta: 'Veränderung zum vorherigen Monat innerhalb des aktuellen Fensters.',
                      },
                      {
                        label: 'Renewal-Load',
                        value: formatCurrency(plannedSpend30Days),
                        meta: 'Summe aller geplanten Zahlungen in den nächsten 30 Tagen.',
                      },
                      {
                        label: 'Pausen-Potenzial',
                        value: formatCurrency(pausedPotential ?? 0),
                        meta: paused.length
                          ? `${paused.length} Services können sofort priorisiert werden.`
                          : 'Derzeit kein pausiertes Sparpotenzial.',
                      },
                      {
                        label: 'Jahresprojektion',
                        value: formatCurrency(yearlyProjection),
                        meta: 'Auf Basis der aktuellen monatlichen Runrate.',
                      },
                    ].map((item) => (
                      <div key={item.label} className="focus-list-row">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-4)]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[var(--text-1)]">
                            {item.value}
                          </p>
                        </div>
                        <p className="max-w-[14rem] text-right text-sm leading-6 text-[var(--text-3)]">
                          {item.meta}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <DonutChart subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6">
                    <UpcomingBills subscriptions={subs} />
                  </div>
                  <div className="panel-card panel-card--interactive flex min-h-[320px] flex-col p-6 md:col-span-2 xl:col-span-1">
                    <TipsPanel onAddSub={openNewModal} />
                  </div>
                </div>
              </div>
            )}

            {page === 'settings' && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="flex flex-col gap-6">
                  <div className="panel-card p-6">
                    <p className="section-title">Workspace-Konfiguration</p>
                    <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                      Nutzer und Design bleiben jetzt lokal gespeichert.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[var(--text-3)]">
                      Jeder Workspace verwaltet eigene Abos, Theme-Einstellungen und Verlaufsdaten.
                      So kannst du zwischen Personen oder Kontexten wechseln, ohne Daten zu
                      vermischen.
                    </p>
                  </div>

                  <UserWorkspacePanel
                    users={workspace.users}
                    activeUserId={activeUser.id}
                    newUserName={newUserName}
                    onNewUserNameChange={setNewUserName}
                    onCreateUser={handleCreateUser}
                    onSelectUser={handleSelectUser}
                    onDeleteUser={handleDeleteUser}
                  />

                  <div className="panel-card p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="section-title">Farbschema</p>
                        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-1)]">
                          Design-Preset
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-3)]">
                          Wähle das Set, das zu {activeUser.name} passt. Die Auswahl wird pro Nutzer
                          direkt im Browser gespeichert.
                        </p>
                      </div>
                      <span className="dashboard-pill">{themeMeta.label} aktiv</span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {THEMES.map((t) => {
                        const isActive = theme === t.id;
                        const rgb = hexToRgb(t.accent);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleThemeChange(t.id)}
                            className="theme-swatch-card"
                            aria-pressed={isActive}
                            style={{
                              borderColor: isActive ? t.accent : 'var(--border)',
                              background: isActive
                                ? `linear-gradient(135deg, rgba(${rgb}, 0.14) 0%, rgba(${rgb}, 0.05) 100%)`
                                : 'rgba(255,255,255,0.02)',
                              boxShadow: isActive
                                ? `0 0 0 1px ${t.accent}33, 0 18px 40px rgba(${rgb}, 0.12)`
                                : 'none',
                            }}
                          >
                            <div className="theme-swatch-card__preview" style={{ background: t.bg }}>
                              <div
                                className="theme-swatch-card__accent"
                                style={{
                                  background: t.accent,
                                  boxShadow: `0 0 20px rgba(${rgb}, 0.45)`,
                                }}
                              />
                              <div className="theme-swatch-card__lines">
                                <div
                                  className="theme-swatch-card__line"
                                  style={{ background: t.accent, opacity: 0.9 }}
                                />
                                <div className="theme-swatch-card__line theme-swatch-card__line--muted" />
                                <div className="theme-swatch-card__line theme-swatch-card__line--small" />
                              </div>
                            </div>

                            <div className="w-full">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[var(--text-1)]">{t.label}</span>
                                {isActive && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
                                    style={{
                                      background: `rgba(${rgb}, 0.15)`,
                                      color: t.accent,
                                    }}
                                  >
                                    Aktiv
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-left text-xs leading-5 text-[var(--text-3)]">
                                {t.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="panel-card p-6">
                    <div>
                      <p className="section-title">Darstellung</p>
                      <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-1)]">
                        Währung
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-3)]">
                        Wähle die Anzeigewährung für alle Beträge im Dashboard.
                      </p>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="currency-select" className="field-label">
                        Währung
                      </label>
                      <select
                        id="currency-select"
                        className="dashboard-input"
                        value={currency}
                        onChange={(event) => handleCurrencyChange(event.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div
                    className="theme-preview-card"
                    style={{
                      background: `linear-gradient(135deg, rgba(${activeThemeRgb}, 0.2) 0%, rgba(${activeThemeRgb}, 0.06) 100%)`,
                      borderColor: `rgba(${activeThemeRgb}, 0.2)`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="dashboard-pill dashboard-pill--accent">Live Preview</span>
                      <span className="dashboard-pill">{themeMeta.label}</span>
                      <span className="dashboard-pill">{activeUser.name}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                      {themeMeta.label} ist fuer {activeUser.name} aktiv.
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{themeMeta.description}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Aktive Abos</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--text-1)]">{active.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Monatlich</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--text-1)]">
                          {formatCurrency(monthlyTotal)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-4)]">Nächster Termin</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--text-1)]">
                          {upcomingRenewal ? shortDateFormatter.format(upcomingRenewal.date) : 'Offen'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="panel-card p-6">
                    <p className="section-title">Workspace Snapshot</p>
                    <div className="space-y-3">
                      <SidebarStat
                        label="Größter Service"
                        value={largestSubscription ? largestSubscription.name : 'Keine Daten'}
                        meta={
                          largestSubscription
                            ? `${formatCurrency(largestSubscription.cost)} pro Monat`
                            : 'Lege ein aktives Abo an'
                        }
                      />
                      <SidebarStat
                        label="Renewals in 30 Tagen"
                        value={`${renewalsInWindow.length}`}
                        meta={`${formatCurrency(plannedSpend30Days)} geplant`}
                      />
                      <SidebarStat
                        label="Top-Kategorie"
                        value={topCategory ? topCategory.category : 'Noch offen'}
                        meta={
                          topCategory
                            ? `${formatCurrency(topCategory.amount)} im Monat`
                            : 'Sobald aktive Services vorhanden sind'
                        }
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handlePageChange('dashboard')}
                        className="dashboard-button dashboard-button--secondary"
                      >
                        <span>Zum Dashboard</span>
                        <Icon.ArrowRight />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePageChange('analytics')}
                        className="dashboard-button dashboard-button--secondary"
                      >
                        <span>Zu Analytics</span>
                        <Icon.ArrowRight />
                      </button>
                    </div>
                  </div>
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

function SidebarStat({ label, value, meta }) {
  return (
    <div className="sidebar-stat">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
          {label}
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--text-1)]">{value}</p>
      </div>
      <p className="text-right text-xs leading-5 text-[var(--text-3)]">{meta}</p>
    </div>
  );
}

function HeroStat({ label, value, meta, icon, accent = false }) {
  return (
    <div className={`hero-stat ${accent ? 'hero-stat--accent' : ''}`}>
      <div className="hero-stat__icon">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-4)]">
          {label}
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--text-1)]">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{meta}</p>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, subAccent = false }) {
  return (
    <div className="panel-card panel-card--interactive relative flex min-h-[138px] flex-col overflow-hidden p-6">
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
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.16) 0%, transparent 72%)',
        }}
      />
    </div>
  );
}
