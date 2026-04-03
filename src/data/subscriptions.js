export const CATEGORIES = {
  Streaming: { color: '#3B82F6', bg: '#1e3a5f' },
  Software: { color: '#F59E0B', bg: '#451a03' },
  Fitness: { color: '#10B981', bg: '#064e3b' },
  Gaming: { color: '#8B5CF6', bg: '#2e1065' },
  Music: { color: '#EC4899', bg: '#500724' },
  Other: { color: '#6B7280', bg: '#1f2937' },
};

export const initialSubscriptions = [
  { id: 1, name: 'Netflix', category: 'Streaming', cost: 15.99, billing: 'monthly', nextBilling: '2026-04-15', status: 'active', icon: '🎬' },
  { id: 2, name: 'Spotify', category: 'Music', cost: 9.99, billing: 'monthly', nextBilling: '2026-04-20', status: 'active', icon: '🎵' },
  { id: 3, name: 'Adobe CC', category: 'Software', cost: 54.99, billing: 'monthly', nextBilling: '2026-05-01', status: 'active', icon: '🎨' },
  { id: 4, name: 'GitHub Pro', category: 'Software', cost: 4.00, billing: 'monthly', nextBilling: '2026-04-18', status: 'active', icon: '💻' },
  { id: 5, name: 'Fitbit Premium', category: 'Fitness', cost: 8.99, billing: 'monthly', nextBilling: '2026-04-22', status: 'paused', icon: '🏃' },
  { id: 6, name: 'Xbox Game Pass', category: 'Gaming', cost: 14.99, billing: 'monthly', nextBilling: '2026-04-28', status: 'active', icon: '🎮' },
  { id: 7, name: 'Headspace', category: 'Fitness', cost: 9.99, billing: 'monthly', nextBilling: '2026-05-05', status: 'active', icon: '🧘' },
  { id: 8, name: 'Disney+', category: 'Streaming', cost: 8.99, billing: 'monthly', nextBilling: '2026-05-10', status: 'active', icon: '✨' },
  { id: 9, name: 'iCloud', category: 'Software', cost: 2.99, billing: 'monthly', nextBilling: '2026-04-14', status: 'active', icon: '☁️' },
  { id: 10, name: 'PS Plus', category: 'Gaming', cost: 8.99, billing: 'monthly', nextBilling: '2026-04-30', status: 'cancelled', icon: '🕹️' },
];

export const monthlyHistory = [
  { month: 'Nov', amount: 112.50 },
  { month: 'Dez', amount: 118.90 },
  { month: 'Jan', amount: 121.40 },
  { month: 'Feb', amount: 127.94 },
  { month: 'Mär', amount: 124.10 },
  { month: 'Apr', amount: 127.94 },
];
