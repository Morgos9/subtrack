/**
 * Subscription price database (EUR, Stand: April 2026)
 * Prices reflect German market; may vary by region/promotion.
 * Sources: official pricing pages of each service.
 */
const PRICE_DB = [
  // --- Streaming ---
  {
    keys: ['netflix'],
    label: 'Netflix', icon: '🎬', category: 'Streaming',
    plans: [
      { label: 'Standard mit Werbung', monthly: 4.99 },
      { label: 'Standard', monthly: 13.99 },
      { label: 'Premium', monthly: 17.99 },
    ],
  },
  {
    keys: ['disney', 'disney+', 'disneyplus'],
    label: 'Disney+', icon: '✨', category: 'Streaming',
    plans: [
      { label: 'Standard mit Werbung', monthly: 5.99 },
      { label: 'Standard', monthly: 8.99 },
      { label: 'Premium', monthly: 11.99 },
    ],
  },
  {
    keys: ['amazon prime', 'prime video', 'amazon video'],
    label: 'Amazon Prime', icon: '📦', category: 'Streaming',
    plans: [
      { label: 'Monatlich', monthly: 8.99 },
      { label: 'Jährlich (÷ 12)', monthly: 7.50 },
    ],
  },
  {
    keys: ['apple tv', 'apple tv+', 'appletv'],
    label: 'Apple TV+', icon: '🍎', category: 'Streaming',
    plans: [{ label: 'Standard', monthly: 9.99 }],
  },
  {
    keys: ['max', 'hbo max', 'hbo'],
    label: 'Max (HBO)', icon: '🎭', category: 'Streaming',
    plans: [
      { label: 'Ultimate', monthly: 15.99 },
    ],
  },
  {
    keys: ['paramount', 'paramount+'],
    label: 'Paramount+', icon: '⭐', category: 'Streaming',
    plans: [
      { label: 'Essential', monthly: 5.99 },
      { label: 'Premium', monthly: 9.99 },
    ],
  },
  {
    keys: ['dazn'],
    label: 'DAZN', icon: '🏆', category: 'Streaming',
    plans: [
      { label: 'DAZN Super Sports', monthly: 24.99 },
      { label: 'DAZN Unlimited', monthly: 34.99 },
    ],
  },
  {
    keys: ['sky', 'sky go', 'sky cinema', 'sky sport'],
    label: 'Sky', icon: '🌤️', category: 'Streaming',
    plans: [
      { label: 'Cinema', monthly: 10.00 },
      { label: 'Sport', monthly: 25.00 },
      { label: 'Komplett', monthly: 35.00 },
    ],
  },
  {
    keys: ['rtl+', 'rtl plus'],
    label: 'RTL+', icon: '📺', category: 'Streaming',
    plans: [
      { label: 'Premium', monthly: 4.99 },
      { label: 'Premium Duo', monthly: 7.99 },
    ],
  },
  {
    keys: ['crunchyroll'],
    label: 'Crunchyroll', icon: '🍣', category: 'Streaming',
    plans: [
      { label: 'Fan', monthly: 7.99 },
      { label: 'Mega Fan', monthly: 9.99 },
      { label: 'Ultimate Fan', monthly: 14.99 },
    ],
  },
  {
    keys: ['mubi'],
    label: 'MUBI', icon: '🎞️', category: 'Streaming',
    plans: [{ label: 'Standard', monthly: 13.99 }],
  },
  {
    keys: ['joyn', 'joyn+'],
    label: 'Joyn+', icon: '📡', category: 'Streaming',
    plans: [{ label: 'Standard', monthly: 6.99 }],
  },
  // --- Musik ---
  {
    keys: ['spotify'],
    label: 'Spotify', icon: '🎵', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 11.99 },
      { label: 'Duo (÷ 2)', monthly: 8.49 },
      { label: 'Family (÷ 6)', monthly: 2.98 },
    ],
  },
  {
    keys: ['apple music'],
    label: 'Apple Music', icon: '🎶', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 10.99 },
      { label: 'Family (÷ 6)', monthly: 2.83 },
    ],
  },
  {
    keys: ['amazon music', 'amazon music unlimited'],
    label: 'Amazon Music', icon: '🎼', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 10.99 },
      { label: 'Prime-Mitglieder', monthly: 9.99 },
    ],
  },
  {
    keys: ['tidal'],
    label: 'Tidal', icon: '🌊', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 10.99 },
      { label: 'HiFi Plus', monthly: 19.99 },
    ],
  },
  {
    keys: ['youtube music', 'yt music'],
    label: 'YouTube Music', icon: '▶️', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 10.99 },
      { label: 'Family (÷ 6)', monthly: 2.83 },
    ],
  },
  {
    keys: ['deezer'],
    label: 'Deezer', icon: '🎸', category: 'Music',
    plans: [
      { label: 'Individual', monthly: 10.99 },
      { label: 'Family (÷ 6)', monthly: 2.50 },
    ],
  },
  // --- Gaming ---
  {
    keys: ['xbox game pass', 'gamepass', 'game pass', 'xbox'],
    label: 'Xbox Game Pass', icon: '🎮', category: 'Gaming',
    plans: [
      { label: 'Core', monthly: 6.99 },
      { label: 'Standard', monthly: 14.99 },
      { label: 'Ultimate', monthly: 17.99 },
    ],
  },
  {
    keys: ['ps plus', 'playstation plus', 'psplus', 'ps+'],
    label: 'PS Plus', icon: '🕹️', category: 'Gaming',
    plans: [
      { label: 'Essential', monthly: 8.99 },
      { label: 'Extra', monthly: 13.99 },
      { label: 'Premium', monthly: 17.99 },
    ],
  },
  {
    keys: ['nintendo switch online', 'nintendo online', 'nintendo'],
    label: 'Nintendo Switch Online', icon: '🎯', category: 'Gaming',
    plans: [
      { label: 'Individual (Jahresabo ÷ 12)', monthly: 1.67 },
      { label: 'Family (Jahresabo ÷ 12)', monthly: 2.92 },
      { label: '+ Erweiterungspaket (÷ 12)', monthly: 3.33 },
    ],
  },
  {
    keys: ['ea play', 'ea games'],
    label: 'EA Play', icon: '🏟️', category: 'Gaming',
    plans: [
      { label: 'EA Play', monthly: 4.99 },
      { label: 'EA Play Pro', monthly: 14.99 },
    ],
  },
  {
    keys: ['ubisoft', 'ubisoft+'],
    label: 'Ubisoft+', icon: '🗡️', category: 'Gaming',
    plans: [{ label: 'Essentials', monthly: 7.99 }, { label: 'Premium', monthly: 17.99 }],
  },
  // --- Software & Produktivität ---
  {
    keys: ['adobe', 'adobe cc', 'adobe creative cloud', 'creative cloud'],
    label: 'Adobe Creative Cloud', icon: '🎨', category: 'Software',
    plans: [
      { label: 'Einzelne App', monthly: 24.99 },
      { label: 'Alle Apps (Abo)', monthly: 54.99 },
      { label: 'Alle Apps (Jahresabo ÷ 12)', monthly: 43.99 },
    ],
  },
  {
    keys: ['microsoft 365', 'office 365', 'microsoft office', 'm365'],
    label: 'Microsoft 365', icon: '📝', category: 'Software',
    plans: [
      { label: 'Personal (÷ 12)', monthly: 6.99 },
      { label: 'Family (÷ 12, ÷ 6)', monthly: 1.67 },
    ],
  },
  {
    keys: ['github', 'github pro', 'github copilot'],
    label: 'GitHub', icon: '💻', category: 'Software',
    plans: [
      { label: 'Pro', monthly: 4.00 },
      { label: 'Copilot Individual', monthly: 10.00 },
    ],
  },
  {
    keys: ['google one', 'google storage'],
    label: 'Google One', icon: '🔷', category: 'Software',
    plans: [
      { label: '100 GB', monthly: 2.99 },
      { label: '200 GB', monthly: 3.99 },
      { label: '2 TB', monthly: 9.99 },
    ],
  },
  {
    keys: ['icloud', 'icloud+'],
    label: 'iCloud+', icon: '☁️', category: 'Software',
    plans: [
      { label: '50 GB', monthly: 0.99 },
      { label: '200 GB', monthly: 2.99 },
      { label: '2 TB', monthly: 9.99 },
    ],
  },
  {
    keys: ['dropbox'],
    label: 'Dropbox', icon: '📂', category: 'Software',
    plans: [
      { label: 'Plus (÷ 12)', monthly: 11.99 },
      { label: 'Professional (÷ 12)', monthly: 19.99 },
    ],
  },
  {
    keys: ['notion'],
    label: 'Notion', icon: '📓', category: 'Software',
    plans: [
      { label: 'Plus (÷ 12)', monthly: 10.00 },
      { label: 'Business (÷ 12)', monthly: 18.00 },
    ],
  },
  {
    keys: ['canva', 'canva pro'],
    label: 'Canva', icon: '🖌️', category: 'Software',
    plans: [
      { label: 'Pro (÷ 12)', monthly: 14.99 },
      { label: 'Teams (÷ 12, ÷ Person)', monthly: 12.00 },
    ],
  },
  {
    keys: ['1password', 'one password'],
    label: '1Password', icon: '🔑', category: 'Software',
    plans: [
      { label: 'Individual (÷ 12)', monthly: 2.99 },
      { label: 'Families (÷ 12)', monthly: 4.99 },
    ],
  },
  {
    keys: ['nordvpn', 'nord vpn'],
    label: 'NordVPN', icon: '🛡️', category: 'Software',
    plans: [
      { label: 'Basic (2J ÷ 24)', monthly: 3.69 },
      { label: 'Plus (2J ÷ 24)', monthly: 4.39 },
      { label: 'Complete (2J ÷ 24)', monthly: 5.29 },
    ],
  },
  {
    keys: ['expressvpn', 'express vpn'],
    label: 'ExpressVPN', icon: '🚀', category: 'Software',
    plans: [{ label: 'Jahresabo (÷ 12)', monthly: 8.32 }],
  },
  {
    keys: ['surfshark'],
    label: 'Surfshark', icon: '🦈', category: 'Software',
    plans: [
      { label: 'Starter (2J ÷ 24)', monthly: 2.49 },
      { label: 'One (2J ÷ 24)', monthly: 3.19 },
    ],
  },
  // --- Fitness & Wellness ---
  {
    keys: ['fitbit', 'fitbit premium'],
    label: 'Fitbit Premium', icon: '🏃', category: 'Fitness',
    plans: [
      { label: 'Monatlich', monthly: 8.99 },
      { label: 'Jährlich (÷ 12)', monthly: 7.99 },
    ],
  },
  {
    keys: ['headspace'],
    label: 'Headspace', icon: '🧘', category: 'Fitness',
    plans: [
      { label: 'Monatlich', monthly: 12.99 },
      { label: 'Jährlich (÷ 12)', monthly: 6.83 },
    ],
  },
  {
    keys: ['calm'],
    label: 'Calm', icon: '🌙', category: 'Fitness',
    plans: [{ label: 'Jährlich (÷ 12)', monthly: 4.58 }],
  },
  {
    keys: ['freeletics'],
    label: 'Freeletics', icon: '💪', category: 'Fitness',
    plans: [
      { label: '3 Monate (÷ 3)', monthly: 19.99 },
      { label: 'Jährlich (÷ 12)', monthly: 9.99 },
    ],
  },
  {
    keys: ['peloton'],
    label: 'Peloton', icon: '🚴', category: 'Fitness',
    plans: [{ label: 'App Membership', monthly: 12.99 }],
  },
];

/**
 * Normalizes a string for fuzzy matching.
 * @param {string} s
 * @returns {string}
 */
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const PRICE_DB_INDEX = PRICE_DB.map(entry => ({
  entry,
  normKeys: entry.keys.map(normalize),
}));

/**
 * Looks up subscription price data by service name.
 * Returns an array of matching entries (max 5), sorted by relevance.
 *
 * @param {string} query - The subscription name typed by the user
 * @returns {{ label: string, icon: string, category: string, plans: {label: string, monthly: number}[] }[]}
 */
export function lookupSubscriptionPrice(query) {
  if (!query || query.trim().length < 2) return [];

  const q = normalize(query.trim());
  if (q.length < 2) return [];

  const scored = PRICE_DB_INDEX.flatMap(({ entry, normKeys }) => {
    let best = 0;
    for (const k of normKeys) {
      if (k === q) { best = 100; break; }
      if (k.startsWith(q) || q.startsWith(k)) { best = Math.max(best, 80); continue; }
      if ((q.length >= 3 && k.includes(q)) || q.includes(k)) { best = Math.max(best, 60); continue; }
      // partial overlap: shared prefix length
      let shared = 0;
      while (shared < q.length && shared < k.length && q[shared] === k[shared]) shared++;
      if (shared >= 3) best = Math.max(best, Math.min(shared * 10, 75));
    }
    return best > 0 ? [{ entry, score: best }] : [];
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ entry }) => entry);
}
