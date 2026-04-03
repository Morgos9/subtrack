import { initialSubscriptions, monthlyHistory } from '../data/subscriptions';

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'subtrack-workspace-v1';
const LEGACY_THEME_KEY = 'subtrack-theme';
const DEFAULT_THEME = 'forest';
const DEFAULT_USER_ID = 'demo-user';

const cloneSubscriptions = (subscriptions = []) => subscriptions.map((sub) => ({ ...sub }));
const cloneHistory = (history = []) => history.map((entry) => ({ ...entry }));

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDemoWorkspace(theme = DEFAULT_THEME) {
  return {
    version: STORAGE_VERSION,
    activeUserId: DEFAULT_USER_ID,
    users: [
      createUserRecord({
        id: DEFAULT_USER_ID,
        name: 'Demo Workspace',
        theme,
        subscriptions: initialSubscriptions,
        history: monthlyHistory,
      }),
    ],
  };
}

function normalizeHistory(history, fallback = []) {
  if (!Array.isArray(history)) return cloneHistory(fallback);

  const normalized = history
    .filter((entry) => entry && typeof entry.month === 'string')
    .map((entry) => ({
      month: entry.month,
      amount: Number(entry.amount) || 0,
    }));

  return normalized.length > 0 ? normalized : cloneHistory(fallback);
}

function normalizeUser(user, index) {
  if (!user || typeof user !== 'object') return null;

  const subscriptions = Array.isArray(user.subscriptions)
    ? cloneSubscriptions(user.subscriptions)
    : cloneSubscriptions(initialSubscriptions);
  const fallbackHistory = subscriptions.length > 0 ? monthlyHistory : [];

  return {
    id: typeof user.id === 'string' && user.id.trim() ? user.id : `user-${index + 1}`,
    name:
      typeof user.name === 'string' && user.name.trim()
        ? user.name.trim()
        : `Workspace ${index + 1}`,
    theme:
      typeof user.theme === 'string' && user.theme.trim() ? user.theme : DEFAULT_THEME,
    subscriptions,
    monthlyHistory: normalizeHistory(user.monthlyHistory, fallbackHistory),
    createdAt:
      typeof user.createdAt === 'string' && user.createdAt.trim()
        ? user.createdAt
        : new Date().toISOString(),
  };
}

function normalizeWorkspace(workspace, fallbackTheme = DEFAULT_THEME) {
  if (!workspace || typeof workspace !== 'object') {
    return createDemoWorkspace(fallbackTheme);
  }

  const users = Array.isArray(workspace.users)
    ? workspace.users
        .map((user, index) => normalizeUser(user, index))
        .filter(Boolean)
    : [];

  if (users.length === 0) {
    return createDemoWorkspace(fallbackTheme);
  }

  const activeUserId = users.some((user) => user.id === workspace.activeUserId)
    ? workspace.activeUserId
    : users[0].id;

  return {
    version: STORAGE_VERSION,
    activeUserId,
    users,
  };
}

export function createUserRecord({
  id = createId('user'),
  name,
  theme = DEFAULT_THEME,
  subscriptions = [],
  history = [],
}) {
  return {
    id,
    name: name.trim(),
    theme,
    subscriptions: cloneSubscriptions(subscriptions),
    monthlyHistory: cloneHistory(history),
    createdAt: new Date().toISOString(),
  };
}

export function loadWorkspace() {
  if (typeof window === 'undefined') {
    return createDemoWorkspace();
  }

  const legacyTheme = window.localStorage.getItem(LEGACY_THEME_KEY) ?? DEFAULT_THEME;

  try {
    const rawWorkspace = window.localStorage.getItem(STORAGE_KEY);
    if (!rawWorkspace) {
      return createDemoWorkspace(legacyTheme);
    }

    return normalizeWorkspace(JSON.parse(rawWorkspace), legacyTheme);
  } catch {
    return createDemoWorkspace(legacyTheme);
  }
}

export function persistWorkspace(workspace) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizeWorkspace(workspace)),
  );
}
