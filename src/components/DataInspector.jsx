import { useState } from 'react';
import { computeStats } from '../utils/detectTypes';

const TYPE_BADGE = {
  numeric: { label: 'NUM', color: 'bg-accent-teal/20 text-accent-teal border-accent-teal/30' },
  datetime: { label: 'DATE', color: 'bg-accent-violet/20 text-accent-violet border-accent-violet/30' },
  categorical: { label: 'CAT', color: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30' },
};

function downloadCSV(rows, columns, fileName) {
  const header = columns.join(',');
  const body = rows.map((r) =>
    columns.map((c) => {
      const v = String(r[c] ?? '');
      return v.includes(',') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    }).join(',')
  ).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (fileName?.replace(/\.[^.]+$/, '') ?? 'data') + '_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataInspector({ data, isDark, isOpen, onToggle }) {
  const [previewRows] = useState(5);

  if (!data) return null;

  const { columns, rows, types, fileName } = data;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2 py-4
                    rounded-l-lg border border-r-0 text-xs font-medium transition-all
                    ${isDark
                      ? 'bg-surface-card border-surface-border text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                    }`}
        title={isOpen ? 'Close inspector' : 'Open data inspector'}
      >
        <span style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
          {isOpen ? 'Close' : 'Inspect'}
        </span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 h-full z-10 flex flex-col transition-all duration-300 overflow-hidden
                    ${isDark
                      ? 'bg-surface-card border-l border-surface-border'
                      : 'bg-white border-l border-slate-200'
                    }
                    ${isOpen ? 'w-80' : 'w-0'}`}
      >
        {isOpen && (
          <div className="flex flex-col h-full w-80">
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b
                            ${isDark ? 'border-surface-border' : 'border-slate-200'}`}>
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Data Inspector
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{fileName}</p>
              </div>
              <button
                onClick={() => downloadCSV(rows, columns, fileName)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium
                           bg-accent-teal/10 border border-accent-teal/30 text-accent-teal
                           hover:bg-accent-teal/20 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>
            </div>

            {/* Summary bar */}
            <div className={`flex gap-4 px-4 py-2.5 border-b text-xs font-mono
                            ${isDark ? 'border-surface-border bg-surface-elevated/40 text-slate-400'
                                    : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
              <span><span className="text-white font-medium">{rows.length.toLocaleString()}</span> rows</span>
              <span><span className="text-white font-medium">{columns.length}</span> cols</span>
              <span><span className="text-accent-teal font-medium">
                {columns.filter((c) => types[c] === 'numeric').length}</span> num</span>
              <span><span className="text-accent-violet font-medium">
                {columns.filter((c) => types[c] === 'datetime').length}</span> date</span>
              <span><span className="text-accent-amber font-medium">
                {columns.filter((c) => types[c] === 'categorical').length}</span> cat</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Column list */}
              <div className="px-4 py-3">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2
                               ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Columns
                </p>
                <div className="space-y-1.5">
                  {columns.map((col) => {
                    const type = types[col];
                    const badge = TYPE_BADGE[type] ?? TYPE_BADGE.categorical;
                    const stats = type === 'numeric' ? computeStats(rows, col) : null;

                    return (
                      <div key={col}
                           className={`rounded p-2.5 ${isDark ? 'bg-surface-elevated' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-mono font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className={`text-sm truncate font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                                title={col}>
                            {col}
                          </span>
                        </div>
                        {stats && (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pl-7 text-xs font-mono">
                            {[
                              ['min', stats.min],
                              ['max', stats.max],
                              ['avg', stats.avg != null ? stats.avg.toPrecision(4) : null],
                            ].map(([label, val]) => (
                              <div key={label} className="flex gap-1">
                                <span className="text-slate-500">{label}</span>
                                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                                  {val != null ? Number(val).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row preview */}
              <div className="px-4 pb-4">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2
                               ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Preview ({previewRows} rows)
                </p>
                <div className="overflow-x-auto rounded border border-surface-border">
                  <table className="text-xs font-mono w-full">
                    <thead>
                      <tr className={isDark ? 'bg-surface-elevated' : 'bg-slate-100'}>
                        {columns.slice(0, 4).map((c) => (
                          <th key={c}
                              className={`px-2 py-1.5 text-left font-medium truncate max-w-[80px]
                                         ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {c}
                          </th>
                        ))}
                        {columns.length > 4 && (
                          <th className={`px-2 py-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>…</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, previewRows).map((row, i) => (
                        <tr key={i}
                            className={`border-t ${isDark ? 'border-surface-border hover:bg-surface-elevated/50'
                                                          : 'border-slate-100 hover:bg-slate-50'}`}>
                          {columns.slice(0, 4).map((c) => (
                            <td key={c}
                                className={`px-2 py-1 truncate max-w-[80px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                                title={String(row[c] ?? '')}>
                              {String(row[c] ?? '')}
                            </td>
                          ))}
                          {columns.length > 4 && (
                            <td className={isDark ? 'text-slate-600 px-2' : 'text-slate-400 px-2'}>…</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
