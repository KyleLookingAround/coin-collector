import { describe, it, expect } from 'vitest';
import { buildTraces } from '../hooks/useAutoCharts';

const TYPES = {
  date: 'datetime',
  revenue: 'numeric',
  cost: 'numeric',
  region: 'categorical',
};

const ROWS = [
  { date: '2024-01-01', revenue: '100', cost: '60', region: 'North' },
  { date: '2024-01-02', revenue: '200', cost: '80', region: 'South' },
  { date: '2024-01-03', revenue: '150', cost: '70', region: 'East' },
];

// ---------------------------------------------------------------------------
// line
// ---------------------------------------------------------------------------
describe('buildTraces — line', () => {
  const config = { type: 'line', xCol: 'date', yCol: 'revenue', extraCols: [] };

  it('returns one trace', () => {
    expect(buildTraces(config, ROWS, TYPES)).toHaveLength(1);
  });

  it('trace type is scatter with lines+markers mode', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.type).toBe('scatter');
    expect(trace.mode).toBe('lines+markers');
  });

  it('x values are dates, y values are numbers', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.x).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
    expect(trace.y).toEqual([100, 200, 150]);
  });

  it('produces one trace per series when extraCols provided', () => {
    const multi = { ...config, extraCols: ['cost'] };
    expect(buildTraces(multi, ROWS, TYPES)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// area
// ---------------------------------------------------------------------------
describe('buildTraces — area', () => {
  const config = { type: 'area', xCol: 'date', yCol: 'revenue', extraCols: [] };

  it('first trace fills to zero', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.fill).toBe('tozeroy');
  });

  it('second trace fills to previous', () => {
    const multi = { ...config, extraCols: ['cost'] };
    const [, second] = buildTraces(multi, ROWS, TYPES);
    expect(second.fill).toBe('tonexty');
  });
});

// ---------------------------------------------------------------------------
// scatter
// ---------------------------------------------------------------------------
describe('buildTraces — scatter', () => {
  const config = { type: 'scatter', xCol: 'revenue', yCol: 'cost', extraCols: [] };

  it('mode is markers', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.mode).toBe('markers');
  });

  it('numeric x and y values are parsed', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.x).toEqual([100, 200, 150]);
    expect(trace.y).toEqual([60, 80, 70]);
  });
});

// ---------------------------------------------------------------------------
// bar (categorical x)
// ---------------------------------------------------------------------------
describe('buildTraces — bar (categorical)', () => {
  const config = { type: 'bar', xCol: 'region', yCol: 'revenue', extraCols: [] };

  it('returns one trace of type bar', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.type).toBe('bar');
  });

  it('aggregates revenue by region', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    const northIdx = trace.x.indexOf('North');
    expect(trace.y[northIdx]).toBe(100);
    const southIdx = trace.x.indexOf('South');
    expect(trace.y[southIdx]).toBe(200);
  });

  it('caps x-axis at 40 categories', () => {
    const manyRows = Array.from({ length: 50 }, (_, i) => ({
      region: `Region${i}`, revenue: '10',
    }));
    const manyTypes = { region: 'categorical', revenue: 'numeric' };
    const [trace] = buildTraces(config, manyRows, manyTypes);
    expect(trace.x.length).toBeLessThanOrEqual(40);
  });
});

// ---------------------------------------------------------------------------
// pie
// ---------------------------------------------------------------------------
describe('buildTraces — pie', () => {
  const config = { type: 'pie', xCol: 'region', yCol: 'revenue', extraCols: [] };

  it('returns one trace of type pie', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.type).toBe('pie');
  });

  it('has labels and values', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.labels).toContain('North');
    expect(trace.values.every((v) => typeof v === 'number')).toBe(true);
  });

  it('sums values per label', () => {
    const dupeRows = [
      { region: 'North', revenue: '100' },
      { region: 'North', revenue: '50' },
      { region: 'South', revenue: '200' },
    ];
    const [trace] = buildTraces(config, dupeRows, TYPES);
    const northIdx = trace.labels.indexOf('North');
    expect(trace.values[northIdx]).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// histogram
// ---------------------------------------------------------------------------
describe('buildTraces — histogram', () => {
  const config = { type: 'histogram', xCol: 'revenue', yCol: null, extraCols: [] };

  it('returns one trace of type histogram', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.type).toBe('histogram');
  });

  it('x values are numeric', () => {
    const [trace] = buildTraces(config, ROWS, TYPES);
    expect(trace.x).toEqual([100, 200, 150]);
  });
});
