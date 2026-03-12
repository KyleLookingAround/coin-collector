import { useMemo } from 'react';
import { toNumber } from '../utils/detectTypes';

const SERIES_COLORS = ['#00d4aa', '#f5a623', '#ff6b6b', '#b78bfa', '#4a9eff', '#50fa7b', '#ffb86c'];

/**
 * Given parsed data, return an array of suggested chart configs.
 * Each config: { id, title, type, xCol, yCol, extraCols }
 */
export function useAutoCharts(data) {
  return useMemo(() => {
    if (!data) return [];

    const { columns, rows, types } = data;
    const numericCols = columns.filter((c) => types[c] === 'numeric');
    const dateCols = columns.filter((c) => types[c] === 'datetime');
    const categoricalCols = columns.filter((c) => types[c] === 'categorical');

    const charts = [];

    // 1. Time-series line chart (date + numerics)
    if (dateCols.length > 0 && numericCols.length > 0) {
      const dateCol = dateCols[0];
      // Up to 3 numeric series on one line chart
      const seriesCols = numericCols.slice(0, 3);
      charts.push({
        id: 'timeseries-0',
        title: `${seriesCols.join(', ')} over time`,
        type: 'line',
        xCol: dateCol,
        yCol: seriesCols[0],
        extraCols: seriesCols.slice(1),
        availableTypes: ['line', 'bar', 'area', 'scatter'],
      });
    }

    // 2. Bar chart — first categorical × first numeric
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      const catCol = categoricalCols[0];
      const numCol = numericCols[0];
      charts.push({
        id: 'bar-cat-0',
        title: `${numCol} by ${catCol}`,
        type: 'bar',
        xCol: catCol,
        yCol: numCol,
        extraCols: [],
        availableTypes: ['bar', 'pie', 'line', 'scatter'],
      });

      // Second categorical if exists
      if (categoricalCols.length > 1 && numericCols.length > 1) {
        charts.push({
          id: 'bar-cat-1',
          title: `${numericCols[1]} by ${categoricalCols[1]}`,
          type: 'bar',
          xCol: categoricalCols[1],
          yCol: numericCols[1],
          extraCols: [],
          availableTypes: ['bar', 'pie', 'line', 'scatter'],
        });
      }
    }

    // 3. Scatter plot — first two numeric columns
    if (numericCols.length >= 2) {
      charts.push({
        id: 'scatter-0',
        title: `${numericCols[0]} vs ${numericCols[1]}`,
        type: 'scatter',
        xCol: numericCols[0],
        yCol: numericCols[1],
        extraCols: [],
        availableTypes: ['scatter', 'line', 'bar'],
      });
    }

    // 4. If only numeric columns (no categories, no dates), histogram-style bar for each
    if (categoricalCols.length === 0 && dateCols.length === 0 && numericCols.length > 0) {
      numericCols.slice(0, 2).forEach((col, i) => {
        charts.push({
          id: `histogram-${i}`,
          title: `Distribution: ${col}`,
          type: 'histogram',
          xCol: col,
          yCol: null,
          extraCols: [],
          availableTypes: ['histogram', 'bar'],
        });
      });
    }

    return charts;
  }, [data]);
}

/**
 * Build Plotly trace(s) from a chart config + data.
 */
export function buildTraces(config, rows, types) {
  const { type, xCol, yCol, extraCols = [] } = config;
  const colors = SERIES_COLORS;

  const getValues = (col) =>
    rows.map((r) => {
      const v = r[col];
      if (types[col] === 'numeric') return toNumber(v);
      return v;
    });

  const xValues = xCol ? getValues(xCol) : [];

  if (type === 'histogram') {
    return [
      {
        type: 'histogram',
        x: xValues,
        marker: { color: colors[0], opacity: 0.85 },
        name: xCol,
      },
    ];
  }

  if (type === 'pie') {
    // Aggregate: sum yCol grouped by xCol
    const agg = {};
    rows.forEach((r) => {
      const key = String(r[xCol] ?? 'Unknown');
      const val = toNumber(r[yCol]);
      agg[key] = (agg[key] ?? 0) + (isNaN(val) ? 0 : val);
    });
    return [
      {
        type: 'pie',
        labels: Object.keys(agg),
        values: Object.values(agg),
        marker: { colors },
        textinfo: 'label+percent',
        hoverinfo: 'label+value+percent',
      },
    ];
  }

  if (type === 'bar' && types[xCol] === 'categorical') {
    // Aggregate yCol by xCol categories
    const agg = {};
    rows.forEach((r) => {
      const key = String(r[xCol] ?? 'Unknown');
      const val = toNumber(r[yCol]);
      agg[key] = (agg[key] ?? 0) + (isNaN(val) ? 0 : val);
    });
    const labels = Object.keys(agg).slice(0, 40); // cap for readability
    return [
      {
        type: 'bar',
        x: labels,
        y: labels.map((l) => agg[l]),
        marker: { color: colors[0], opacity: 0.9 },
        name: yCol,
      },
    ];
  }

  // line / area / scatter / bar (time-based)
  const allSeries = [yCol, ...extraCols].filter(Boolean);
  return allSeries.map((col, i) => {
    const yValues = getValues(col);
    const base = {
      x: xValues,
      y: yValues,
      name: col,
      marker: { color: colors[i % colors.length] },
      line: { color: colors[i % colors.length], width: 2 },
    };

    if (type === 'area') {
      return { ...base, type: 'scatter', mode: 'lines', fill: i === 0 ? 'tozeroy' : 'tonexty' };
    }
    if (type === 'line') {
      return { ...base, type: 'scatter', mode: 'lines+markers' };
    }
    if (type === 'scatter') {
      return { ...base, type: 'scatter', mode: 'markers', marker: { ...base.marker, size: 6 } };
    }
    if (type === 'bar') {
      return { ...base, type: 'bar' };
    }
    return { ...base, type: 'scatter', mode: 'lines+markers' };
  });
}

export { SERIES_COLORS };
