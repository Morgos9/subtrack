import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Pure helpers (mirrors what App.jsx would use once billing-aware)
// ---------------------------------------------------------------------------

/**
 * Returns the monthly cost equivalent for a subscription.
 * @param {{ cost: number, billing: string }} sub
 * @returns {number}
 */
function toMonthlyCost(sub) {
  switch (sub.billing) {
    case 'yearly':    return sub.cost / 12;
    case 'quarterly': return sub.cost / 3;
    case 'weekly':    return (sub.cost * 52) / 12;
    case 'monthly':
    default:          return sub.cost;
  }
}

/**
 * Returns the total monthly cost for a list of subscriptions.
 * Only active subscriptions are counted.
 * @param {Array<{ cost: number, billing: string, status: string }>} subs
 * @returns {number}
 */
function calcMonthlyTotal(subs) {
  return subs
    .filter((sub) => sub.status === 'active')
    .reduce((sum, sub) => sum + toMonthlyCost(sub), 0);
}

/**
 * Filters subscriptions by status.
 * @param {Array<{ status: string }>} subs
 * @param {string} status
 * @returns {Array}
 */
function filterByStatus(subs, status) {
  return subs.filter((sub) => sub.status === status);
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleSubs = [
  { id: 1, name: 'Netflix',      cost: 15.99, billing: 'monthly',   status: 'active'    },
  { id: 2, name: 'Adobe CC',     cost: 54.99, billing: 'monthly',   status: 'active'    },
  { id: 3, name: 'GitHub Pro',   cost: 48.00, billing: 'yearly',    status: 'active'    },
  { id: 4, name: 'Headspace',    cost: 29.97, billing: 'quarterly', status: 'active'    },
  { id: 5, name: 'Fitbit',       cost: 8.99,  billing: 'monthly',   status: 'paused'    },
  { id: 6, name: 'PS Plus',      cost: 59.99, billing: 'yearly',    status: 'cancelled' },
];

// ---------------------------------------------------------------------------
// 1. Monthly cost calculation per billing interval
// ---------------------------------------------------------------------------

describe('toMonthlyCost', () => {
  it('returns cost directly for monthly billing', () => {
    expect(toMonthlyCost({ cost: 15.99, billing: 'monthly' })).toBeCloseTo(15.99);
  });

  it('divides by 12 for yearly billing', () => {
    expect(toMonthlyCost({ cost: 48.00, billing: 'yearly' })).toBeCloseTo(4.00);
  });

  it('divides by 3 for quarterly billing', () => {
    expect(toMonthlyCost({ cost: 29.97, billing: 'quarterly' })).toBeCloseTo(9.99);
  });

  it('uses monthly rate as fallback for unknown billing', () => {
    expect(toMonthlyCost({ cost: 5.00, billing: 'unknown' })).toBeCloseTo(5.00);
  });
});

// ---------------------------------------------------------------------------
// 2. Total monthly cost — only active subscriptions
// ---------------------------------------------------------------------------

describe('calcMonthlyTotal', () => {
  it('sums monthly-equivalent costs for all active subscriptions', () => {
    // active: Netflix 15.99 + Adobe 54.99 + GitHub 48/12=4.00 + Headspace 29.97/3=9.99 = 84.97
    expect(calcMonthlyTotal(sampleSubs)).toBeCloseTo(84.97);
  });

  it('returns 0 when there are no active subscriptions', () => {
    const noActive = sampleSubs.map((sub) => ({ ...sub, status: 'paused' }));
    expect(calcMonthlyTotal(noActive)).toBe(0);
  });

  it('ignores paused subscriptions', () => {
    const pausedOnly = [{ id: 99, cost: 100, billing: 'monthly', status: 'paused' }];
    expect(calcMonthlyTotal(pausedOnly)).toBe(0);
  });

  it('ignores cancelled subscriptions', () => {
    const cancelledOnly = [{ id: 99, cost: 100, billing: 'monthly', status: 'cancelled' }];
    expect(calcMonthlyTotal(cancelledOnly)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Filtering by status
// ---------------------------------------------------------------------------

describe('filterByStatus', () => {
  it('returns only active subscriptions', () => {
    const result = filterByStatus(sampleSubs, 'active');
    expect(result).toHaveLength(4);
    expect(result.every((sub) => sub.status === 'active')).toBe(true);
  });

  it('returns only paused subscriptions', () => {
    const result = filterByStatus(sampleSubs, 'paused');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Fitbit');
  });

  it('returns only cancelled subscriptions', () => {
    const result = filterByStatus(sampleSubs, 'cancelled');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('PS Plus');
  });

  it('returns empty array when no subscriptions match', () => {
    const result = filterByStatus(sampleSubs, 'trial');
    expect(result).toHaveLength(0);
  });
});
