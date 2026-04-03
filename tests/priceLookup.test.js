import { describe, it, expect } from 'vitest';
import { lookupSubscriptionPrice } from '../src/utils/priceLookup.js';

// ---------------------------------------------------------------------------
// Fuzzy Matching
// ---------------------------------------------------------------------------

describe('lookupSubscriptionPrice — Fuzzy Matching', () => {
  it('finds Netflix by exact key "netflix"', () => {
    const results = lookupSubscriptionPrice('netflix');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toBe('Netflix');
  });

  it('finds Spotify despite typo "spotifi"', () => {
    const results = lookupSubscriptionPrice('spotifi');
    expect(results.length).toBeGreaterThan(0);
    const labels = results.map((r) => r.label);
    expect(labels).toContain('Spotify');
  });

  it('finds Disney+ by partial key "disney"', () => {
    const results = lookupSubscriptionPrice('disney');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toBe('Disney+');
  });

  it('finds Adobe Creative Cloud by partial key "adobe"', () => {
    const results = lookupSubscriptionPrice('adobe');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toBe('Adobe Creative Cloud');
  });
});

// ---------------------------------------------------------------------------
// Empty / short query guard
// ---------------------------------------------------------------------------

describe('lookupSubscriptionPrice — Leere Query Guard', () => {
  it('returns empty array for empty string', () => {
    expect(lookupSubscriptionPrice('')).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(lookupSubscriptionPrice(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(lookupSubscriptionPrice(undefined)).toEqual([]);
  });

  it('returns empty array for single character query', () => {
    expect(lookupSubscriptionPrice('n')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(lookupSubscriptionPrice('   ')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Exakter Match — korrekter EUR-Preis
// ---------------------------------------------------------------------------

describe('lookupSubscriptionPrice — Exakter Match mit Preis', () => {
  it('Netflix hat Standard-Plan mit 13.99 EUR/Monat', () => {
    const results = lookupSubscriptionPrice('netflix');
    const netflix = results[0];
    expect(netflix).toBeDefined();
    const standardPlan = netflix.plans.find((p) => p.label === 'Standard');
    expect(standardPlan).toBeDefined();
    expect(standardPlan.monthly).toBe(13.99);
  });

  it('Spotify hat Individual-Plan mit 11.99 EUR/Monat', () => {
    const results = lookupSubscriptionPrice('spotify');
    const spotify = results[0];
    expect(spotify).toBeDefined();
    const individualPlan = spotify.plans.find((p) => p.label === 'Individual');
    expect(individualPlan).toBeDefined();
    expect(individualPlan.monthly).toBe(11.99);
  });

  it('GitHub Pro hat Pro-Plan mit 4.00 EUR/Monat', () => {
    const results = lookupSubscriptionPrice('github');
    expect(results.length).toBeGreaterThan(0);
    const github = results[0];
    const proPlan = github.plans.find((p) => p.label === 'Pro');
    expect(proPlan).toBeDefined();
    expect(proPlan.monthly).toBe(4.00);
  });

  it('Ergebnis enthält label, icon, category und plans', () => {
    const results = lookupSubscriptionPrice('netflix');
    const entry = results[0];
    expect(entry).toHaveProperty('label');
    expect(entry).toHaveProperty('icon');
    expect(entry).toHaveProperty('category');
    expect(entry).toHaveProperty('plans');
    expect(Array.isArray(entry.plans)).toBe(true);
  });

  it('liefert maximal 5 Ergebnisse', () => {
    const results = lookupSubscriptionPrice('a'); // Zu kurz — aber testen wir mit "amazon"
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('gibt maximal 5 Ergebnisse für breiten Match zurück', () => {
    const results = lookupSubscriptionPrice('amazon');
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
