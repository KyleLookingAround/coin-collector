const ACCENT_CYCLE = ['text-accent-teal', 'text-accent-amber', 'text-accent-coral', 'text-accent-violet'];

function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(2) + 'K';
  // Show up to 4 significant digits
  const str = Number(val.toPrecision(6)).toString();
  return str;
}

export default function StatCard({ column, stats, index }) {
  const accentClass = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  const metrics = [
    { label: 'MIN', value: stats.min },
    { label: 'MAX', value: stats.max },
    { label: 'AVG', value: stats.avg },
    { label: 'SUM', value: stats.sum },
  ];

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-current ${accentClass}`} />
        <h3 className="text-sm font-semibold text-slate-300 truncate" title={column}>
          {column}
        </h3>
        <span className="ml-auto text-xs font-mono text-slate-600 shrink-0">
          n={stats.count.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-surface-elevated rounded p-2">
            <div className="text-xs text-slate-500 font-medium mb-0.5">{label}</div>
            <div className={`stat-value text-sm font-medium ${accentClass}`}>
              {formatNumber(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
