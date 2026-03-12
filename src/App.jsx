import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DashboardGrid from './components/DashboardGrid';
import DataInspector from './components/DataInspector';
import ThemeToggle from './components/ThemeToggle';
import { useFileParser } from './hooks/useFileParser';
import { useAutoCharts } from './hooks/useAutoCharts';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const { parseFile, data, error, loading } = useFileParser();
  const chartConfigs = useAutoCharts(data);

  // Apply dark/light class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  const hasData = data !== null;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-surface text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
      {/* Top bar — shown after data load */}
      {hasData && (
        <header className={`flex items-center gap-3 px-4 py-2.5 border-b sticky top-0 z-30
                           ${isDark ? 'bg-surface-card border-surface-border' : 'bg-white border-slate-200'}`}>
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-6 h-6 rounded bg-accent-teal/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-white">DataLens</span>
          </div>

          {/* File info */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono
                          ${isDark ? 'border-surface-border bg-surface-elevated text-slate-400'
                                   : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {data.fileName}
            <span className={`ml-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              {data.rows.length.toLocaleString()}r × {data.columns.length}c
            </span>
          </div>

          {/* Type summary */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            {data.columns.filter((c) => data.types[c] === 'numeric').length > 0 && (
              <span className="px-2 py-0.5 rounded border bg-accent-teal/10 border-accent-teal/30 text-accent-teal">
                {data.columns.filter((c) => data.types[c] === 'numeric').length} num
              </span>
            )}
            {data.columns.filter((c) => data.types[c] === 'datetime').length > 0 && (
              <span className="px-2 py-0.5 rounded border bg-accent-violet/10 border-accent-violet/30 text-accent-violet">
                {data.columns.filter((c) => data.types[c] === 'datetime').length} date
              </span>
            )}
            {data.columns.filter((c) => data.types[c] === 'categorical').length > 0 && (
              <span className="px-2 py-0.5 rounded border bg-accent-amber/10 border-accent-amber/30 text-accent-amber">
                {data.columns.filter((c) => data.types[c] === 'categorical').length} cat
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <FileUpload onFile={parseFile} compact />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-teal/30 border-t-accent-teal rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Parsing file…</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="card max-w-md w-full mx-4 p-5 border-accent-coral/30 bg-accent-coral/5">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-accent-coral shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-accent-coral">Parse Error</p>
                  <p className="text-sm text-slate-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <FileUpload onFile={parseFile} compact />
          </div>
        )}

        {/* Upload state (no data yet) */}
        {!loading && !error && !hasData && (
          <div className="flex-1 flex flex-col">
            {/* Theme toggle in top-right even on landing */}
            <div className="absolute top-4 right-4 z-10">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
            </div>
            <FileUpload onFile={parseFile} />
          </div>
        )}

        {/* Dashboard */}
        {!loading && !error && hasData && (
          <div className="flex-1 flex overflow-hidden">
            <DashboardGrid data={data} chartConfigs={chartConfigs} isDark={isDark} />
          </div>
        )}

        {/* Data Inspector sidebar */}
        {hasData && (
          <DataInspector
            data={data}
            isDark={isDark}
            isOpen={inspectorOpen}
            onToggle={() => setInspectorOpen((v) => !v)}
          />
        )}
      </main>
    </div>
  );
}
