import { describe, it, expect } from 'vitest';
import { addDays, formatDateDE, parseISODateLocal, startOfDay } from '../src/utils/date.js';

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe('addDays', () => {
  it('adds positive days correctly', () => {
    const base = new Date(2024, 0, 1); // 1. Jan 2024
    const result = addDays(base, 10);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(11);
  });

  it('subtracts days when n is negative', () => {
    const base = new Date(2024, 0, 10); // 10. Jan 2024
    const result = addDays(base, -5);
    expect(result.getDate()).toBe(5);
    expect(result.getMonth()).toBe(0);
  });

  it('crosses month boundaries correctly', () => {
    const base = new Date(2024, 0, 30); // 30. Jan 2024
    const result = addDays(base, 5);
    expect(result.getMonth()).toBe(1); // Februar
    expect(result.getDate()).toBe(4);
  });

  it('crosses year boundaries correctly', () => {
    const base = new Date(2023, 11, 31); // 31. Dez 2023
    const result = addDays(base, 1);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it('adding 0 days returns same date', () => {
    const base = new Date(2024, 5, 15);
    const result = addDays(base, 0);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(5);
    expect(result.getFullYear()).toBe(2024);
  });

  it('does not mutate the original date', () => {
    const base = new Date(2024, 0, 1);
    addDays(base, 10);
    expect(base.getDate()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// formatDateDE
// ---------------------------------------------------------------------------

describe('formatDateDE', () => {
  // de-DE locale formats as D.M.YYYY (no leading zeros) by default in Node
  it('contains the correct day, month and year separated by dots', () => {
    const date = new Date(2024, 0, 5); // 5. Jan 2024
    const result = formatDateDE(date);
    // Both '5.1.2024' (Node) and '05.01.2024' (browser) are valid de-DE output
    expect(result).toMatch(/5[./]1[./]2024/);
  });

  it('formats a date with day and month > 9 correctly', () => {
    const date = new Date(2024, 11, 25); // 25. Dez 2024
    const result = formatDateDE(date);
    expect(result).toMatch(/25[./]12[./]2024/);
  });

  it('contains the correct year', () => {
    const date = new Date(2000, 5, 1); // 1. Jun 2000
    const result = formatDateDE(date);
    expect(result).toContain('2000');
    expect(result).toMatch(/1[./]6[./]2000/);
  });

  it('returns a string', () => {
    const date = new Date(2024, 3, 10);
    expect(typeof formatDateDE(date)).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// parseISODateLocal
// ---------------------------------------------------------------------------

describe('parseISODateLocal', () => {
  it('parses a valid ISO date string to a local Date', () => {
    const result = parseISODateLocal('2024-03-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2); // März = Index 2
    expect(result.getDate()).toBe(15);
  });

  it('sets time to midnight (local)', () => {
    const result = parseISODateLocal('2024-01-01');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('returns null for non-string input', () => {
    expect(parseISODateLocal(null)).toBeNull();
    expect(parseISODateLocal(undefined)).toBeNull();
    expect(parseISODateLocal(20240101)).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseISODateLocal('15.03.2024')).toBeNull();
    expect(parseISODateLocal('2024/03/15')).toBeNull();
    expect(parseISODateLocal('')).toBeNull();
    expect(parseISODateLocal('not-a-date')).toBeNull();
  });

  it('parses year-boundary date correctly', () => {
    const result = parseISODateLocal('2023-12-31');
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(11); // Dezember = Index 11
    expect(result.getDate()).toBe(31);
  });
});

// ---------------------------------------------------------------------------
// startOfDay
// ---------------------------------------------------------------------------

describe('startOfDay', () => {
  it('sets time to midnight', () => {
    const date = new Date(2024, 3, 10, 15, 30, 45, 500);
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('keeps the same date', () => {
    const date = new Date(2024, 3, 10, 23, 59, 59);
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(10);
  });

  it('does not mutate the original date', () => {
    const date = new Date(2024, 0, 1, 12, 0, 0);
    startOfDay(date);
    expect(date.getHours()).toBe(12);
  });

  it('works when date is already at midnight', () => {
    const date = new Date(2024, 0, 1, 0, 0, 0, 0);
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});
