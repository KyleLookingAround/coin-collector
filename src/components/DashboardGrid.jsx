import StatCard from './StatCard';
import ChartPanel from './ChartPanel';
import { computeStats } from '../utils/detectTypes';

export default function DashboardGrid({ data, chartConfigs, isDark }) {
  const { columns, rows, types } = data;
  const numericCols = columns.filter((c) => types[c] === 'numeric');

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ paddingRight: '2.5rem' }}>
      {/* Stat cards row */}
      {numericCols.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Summary Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {numericCols.map((col, i) => (
              <StatCard
                key={col}
                column={col}
                stats={computeStats(rows, col)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Charts grid */}
      {chartConfigs.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Charts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chartConfigs.map((cfg) => (
              <ChartPanel
                key={cfg.id}
                config={cfg}
                rows={rows}
                types={types}
                columns={columns}
                isDark={isDark}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {chartConfigs.length === 0 && numericCols.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 text-sm">
            No numeric or date columns detected — no charts to generate.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Check the Data Inspector to review detected column types.
          </p>
        </div>
      )}
    </div>
  );
}
