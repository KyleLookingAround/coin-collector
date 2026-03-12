import { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { buildTraces } from '../hooks/useAutoCharts';

const PLOTLY_DARK_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#94a3b8', family: "'JetBrains Mono', monospace", size: 11 },
  xaxis: {
    gridcolor: '#2a3547',
    linecolor: '#2a3547',
    tickcolor: '#2a3547',
    zerolinecolor: '#2a3547',
  },
  yaxis: {
    gridcolor: '#2a3547',
    linecolor: '#2a3547',
    tickcolor: '#2a3547',
    zerolinecolor: '#2a3547',
  },
  legend: { bgcolor: 'rgba(0,0,0,0)', bordercolor: '#2a3547', font: { color: '#94a3b8' } },
  margin: { t: 10, r: 10, b: 50, l: 55 },
  hoverlabel: { bgcolor: '#1c2532', bordercolor: '#2a3547', font: { color: '#e2e8f0' } },
  autosize: true,
};

const PLOTLY_LIGHT_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#475569', family: "'JetBrains Mono', monospace", size: 11 },
  xaxis: { gridcolor: '#e2e8f0', linecolor: '#cbd5e1', tickcolor: '#cbd5e1', zerolinecolor: '#e2e8f0' },
  yaxis: { gridcolor: '#e2e8f0', linecolor: '#cbd5e1', tickcolor: '#cbd5e1', zerolinecolor: '#e2e8f0' },
  legend: { bgcolor: 'rgba(0,0,0,0)', bordercolor: '#e2e8f0', font: { color: '#475569' } },
  margin: { t: 10, r: 10, b: 50, l: 55 },
  hoverlabel: { bgcolor: '#ffffff', bordercolor: '#e2e8f0', font: { color: '#1e293b' } },
  autosize: true,
};

export default function ChartPanel({ config: initialConfig, rows, types, columns, isDark }) {
  const [config, setConfig] = useState(initialConfig);
  const [showControls, setShowControls] = useState(false);

  const traces = buildTraces(config, rows, types);
  const layout = isDark ? PLOTLY_DARK_LAYOUT : PLOTLY_LIGHT_LAYOUT;

  const handleDownloadPNG = useCallback(() => {
    // Use Plotly's built-in download — trigger via the modebar or programmatically
    const plotEl = document.getElementById(`plot-${config.id}`);
    if (plotEl && window.Plotly) {
      window.Plotly.downloadImage(plotEl, { format: 'png', filename: config.title || 'chart' });
    }
  }, [config]);

  const numericCols = columns.filter((c) => types[c] === 'numeric');
  const allCols = columns;

  return (
    <div className={`card flex flex-col ${isDark ? '' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-surface-border">
        <h4 className="text-sm font-semibold text-slate-200 truncate flex-1" title={config.title}>
          {config.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          {/* Chart type selector */}
          <select
            value={config.type}
            onChange={(e) => setConfig((c) => ({ ...c, type: e.target.value }))}
            className="text-xs bg-surface-elevated border border-surface-border text-slate-300
                       rounded px-1.5 py-1 cursor-pointer focus:outline-none focus:border-accent-teal/50"
          >
            {config.availableTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Axis controls toggle */}
          <button
            onClick={() => setShowControls((v) => !v)}
            className={`p-1.5 rounded hover:bg-surface-elevated transition-colors
                        ${showControls ? 'text-accent-teal' : 'text-slate-500 hover:text-slate-300'}`}
            title="Axis settings"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          {/* Download PNG */}
          <button
            onClick={handleDownloadPNG}
            className="p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-surface-elevated transition-colors"
            title="Download PNG"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Axis controls (collapsible) */}
      {showControls && config.type !== 'histogram' && (
        <div className="flex flex-wrap gap-3 px-4 py-2 border-b border-surface-border bg-surface-elevated/40">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 w-6">X</label>
            <select
              value={config.xCol}
              onChange={(e) => setConfig((c) => ({ ...c, xCol: e.target.value }))}
              className="text-xs bg-surface-elevated border border-surface-border text-slate-300
                         rounded px-1.5 py-1 focus:outline-none focus:border-accent-teal/50"
            >
              {allCols.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {config.type !== 'pie' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 w-6">Y</label>
              <select
                value={config.yCol}
                onChange={(e) => setConfig((c) => ({ ...c, yCol: e.target.value }))}
                className="text-xs bg-surface-elevated border border-surface-border text-slate-300
                           rounded px-1.5 py-1 focus:outline-none focus:border-accent-teal/50"
              >
                {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 p-2" style={{ minHeight: 260 }}>
        <Plot
          divId={`plot-${config.id}`}
          data={traces}
          layout={layout}
          config={{
            displayModeBar: true,
            modeBarButtonsToRemove: ['sendDataToCloud', 'editInChartStudio'],
            displaylogo: false,
            responsive: true,
            toImageButtonOptions: { format: 'png', filename: config.title || 'chart', scale: 2 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%', minHeight: 250 }}
        />
      </div>
    </div>
  );
}
