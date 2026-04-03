export const CATEGORIES = {
  Streaming: { color: '#a3e635', bg: 'rgba(163,230,53,0.12)' },
  Software:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  Fitness:   { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  Gaming:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  Music:     { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  Other:     { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

export const initialSubscriptions = [
  { id: 1, name: 'Netflix',       category: 'Streaming', cost: 15.99, billing: 'monthly', nextBilling: '2026-04-15', status: 'active',    icon: '🎬' },
  { id: 2, name: 'Spotify',       category: 'Music',     cost: 9.99,  billing: 'monthly', nextBilling: '2026-04-20', status: 'active',    icon: '🎵' },
  { id: 3, name: 'Adobe CC',      category: 'Software',  cost: 54.99, billing: 'monthly', nextBilling: '2026-05-01', status: 'active',    icon: '🎨' },
  { id: 4, name: 'GitHub Pro',    category: 'Software',  cost: 4.00,  billing: 'monthly', nextBilling: '2026-04-18', status: 'active',    icon: '💻' },
  { id: 5, name: 'Fitbit Premium',category: 'Fitness',   cost: 8.99,  billing: 'monthly', nextBilling: '2026-04-22', status: 'paused',   icon: '🏃' },
  { id: 6, name: 'Xbox Game Pass',category: 'Gaming',    cost: 14.99, billing: 'monthly', nextBilling: '2026-04-28', status: 'active',    icon: '🎮' },
  { id: 7, name: 'Headspace',     category: 'Fitness',   cost: 9.99,  billing: 'monthly', nextBilling: '2026-05-05', status: 'active',    icon: '🧘' },
  { id: 8, name: 'Disney+',       category: 'Streaming', cost: 8.99,  billing: 'monthly', nextBilling: '2026-05-10', status: 'active',    icon: '✨' },
  { id: 9, name: 'iCloud',        category: 'Software',  cost: 2.99,  billing: 'monthly', nextBilling: '2026-04-14', status: 'active',    icon: '☁️' },
  { id: 10,name: 'PS Plus',       category: 'Gaming',    cost: 8.99,  billing: 'monthly', nextBilling: '2026-04-30', status: 'cancelled', icon: '🕹️' },
];

export const monthlyHistory = [
  { month: 'Nov', amount: 112.50 },
  { month: 'Dez', amount: 118.90 },
  { month: 'Jan', amount: 121.40 },
  { month: 'Feb', amount: 127.94 },
  { month: 'Mär', amount: 124.10 },
  { month: 'Apr', amount: 127.94 },
];
