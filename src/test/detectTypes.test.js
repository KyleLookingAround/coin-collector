import { describe, it, expect } from 'vitest';
import { detectTypes, computeStats, toNumber } from '../utils/detectTypes';

// ---------------------------------------------------------------------------
// toNumber
// ---------------------------------------------------------------------------
describe('toNumber', () => {
  it('parses plain integers', () => expect(toNumber('42')).toBe(42));
  it('parses floats', () => expect(toNumber('3.14')).toBe(3.14));
  it('parses negative values', () => expect(toNumber('-7')).toBe(-7));
  it('strips commas from formatted numbers', () => expect(toNumber('1,234,567')).toBe(1234567));
  it('returns NaN for empty string', () => expect(toNumber('')).toBeNaN());
  it('returns NaN for null', () => expect(toNumber(null)).toBeNaN());
  it('returns NaN for non-numeric text', () => expect(toNumber('hello')).toBeNaN());
  it('handles numeric values passed directly', () => expect(toNumber(99)).toBe(99));
});

// ---------------------------------------------------------------------------
// detectTypes
// ---------------------------------------------------------------------------
describe('detectTypes', () => {
  it('returns empty object for empty rows', () => {
    expect(detectTypes([])).toEqual({});
  });

  it('returns empty object for null/undefined', () => {
    expect(detectTypes(null)).toEqual({});
  });

  it('detects a numeric column', () => {
    const rows = [{ price: '10.5' }, { price: '20' }, { price: '30.1' }];
    expect(detectTypes(rows)).toEqual({ price: 'numeric' });
  });

  it('detects a categorical column', () => {
    const rows = [{ city: 'London' }, { city: 'Paris' }, { city: 'Tokyo' }];
    expect(detectTypes(rows)).toEqual({ city: 'categorical' });
  });

  it('detects ISO 8601 dates', () => {
    const rows = [
      { date: '2024-01-01' },
      { date: '2024-02-15' },
      { date: '2024-03-20' },
    ];
    expect(detectTypes(rows)).toEqual({ date: 'datetime' });
  });

  it('detects MM/DD/YYYY dates', () => {
    const rows = [
      { date: '01/15/2024' },
      { date: '03/22/2024' },
      { date: '07/04/2024' },
    ];
    expect(detectTypes(rows)).toEqual({ date: 'datetime' });
  });

  it('detects mixed columns in a multi-column dataset', () => {
    const rows = [
      { date: '2024-01-01', revenue: '1000', region: 'North' },
      { date: '2024-01-02', revenue: '1500', region: 'South' },
      { date: '2024-01-03', revenue: '1200', region: 'East' },
    ];
    const types = detectTypes(rows);
    expect(types.date).toBe('datetime');
    expect(types.revenue).toBe('numeric');
    expect(types.region).toBe('categorical');
  });

  it('falls back to categorical when column is all empty', () => {
    const rows = [{ x: '' }, { x: '' }, { x: '' }];
    expect(detectTypes(rows).x).toBe('categorical');
  });

  it('detects numeric when most (≥70%) values are numbers despite a few blanks', () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ v: i < 8 ? String(i) : '' }));
    expect(detectTypes(rows).v).toBe('numeric');
  });

  it('falls back to categorical when fewer than 70% of values are numeric', () => {
    // 5 numeric out of 10 = 50%
    const rows = Array.from({ length: 10 }, (_, i) => ({ v: i < 5 ? String(i) : 'text' }));
    expect(detectTypes(rows).v).toBe('categorical');
  });
});

// ---------------------------------------------------------------------------
// computeStats
// ---------------------------------------------------------------------------
describe('computeStats', () => {
  const rows = [
    { val: '10' },
    { val: '20' },
    { val: '30' },
    { val: '40' },
  ];

  it('computes min correctly', () => expect(computeStats(rows, 'val').min).toBe(10));
  it('computes max correctly', () => expect(computeStats(rows, 'val').max).toBe(40));
  it('computes avg correctly', () => expect(computeStats(rows, 'val').avg).toBe(25));
  it('computes sum correctly', () => expect(computeStats(rows, 'val').sum).toBe(100));
  it('reports correct count', () => expect(computeStats(rows, 'val').count).toBe(4));

  it('ignores blank/non-numeric values', () => {
    const mixed = [{ v: '5' }, { v: '' }, { v: 'N/A' }, { v: '15' }];
    const stats = computeStats(mixed, 'v');
    expect(stats.count).toBe(2);
    expect(stats.sum).toBe(20);
    expect(stats.avg).toBe(10);
  });

  it('returns nulls and zero count for all-empty column', () => {
    const empty = [{ v: '' }, { v: '' }];
    const stats = computeStats(empty, 'v');
    expect(stats.count).toBe(0);
    expect(stats.min).toBeNull();
    expect(stats.max).toBeNull();
    expect(stats.avg).toBeNull();
    expect(stats.sum).toBeNull();
  });

  it('handles comma-formatted numbers', () => {
    const rows2 = [{ v: '1,000' }, { v: '2,000' }];
    expect(computeStats(rows2, 'v').sum).toBe(3000);
  });

  it('handles negative values', () => {
    const rows3 = [{ v: '-10' }, { v: '10' }];
    const stats = computeStats(rows3, 'v');
    expect(stats.min).toBe(-10);
    expect(stats.max).toBe(10);
    expect(stats.avg).toBe(0);
  });

  it('works with a single-row dataset', () => {
    const single = [{ v: '42' }];
    const stats = computeStats(single, 'v');
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
    expect(stats.avg).toBe(42);
  });
});
