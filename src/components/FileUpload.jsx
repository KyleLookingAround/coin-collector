import { useCallback, useState } from 'react';

export default function FileUpload({ onFile, compact = false }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  if (compact) {
    return (
      <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-teal/10 border
                        border-accent-teal/30 text-accent-teal text-sm font-medium cursor-pointer
                        hover:bg-accent-teal/20 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload File
        <input type="file" accept=".csv,.json" onChange={handleChange} className="hidden" />
      </label>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Hero text */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent-teal/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">DataLens</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Drop a CSV or JSON file — get instant interactive charts and stats.
        </p>
        <p className="text-slate-500 text-sm mt-2">No backend. No uploads. Everything runs in your browser.</p>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-xl flex flex-col items-center justify-center gap-4 p-12 rounded-xl
                    border-2 border-dashed cursor-pointer transition-all duration-200
                    ${dragging
                      ? 'border-accent-teal bg-accent-teal/10 scale-[1.02]'
                      : 'border-surface-border bg-surface-card hover:border-accent-teal/50 hover:bg-surface-elevated'
                    }`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
                         ${dragging ? 'bg-accent-teal/20' : 'bg-surface-elevated'}`}>
          <svg className={`w-8 h-8 transition-colors ${dragging ? 'text-accent-teal' : 'text-slate-500'}`}
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-white font-medium">
            {dragging ? 'Drop to load' : 'Drag & drop your file here'}
          </p>
          <p className="text-slate-500 text-sm mt-1">or click to browse</p>
        </div>

        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-elevated text-slate-400 border border-surface-border">.csv</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-surface-elevated text-slate-400 border border-surface-border">.json</span>
        </div>

        <input type="file" accept=".csv,.json" onChange={handleChange} className="hidden" />
      </label>

      {/* Example hint */}
      <p className="mt-6 text-slate-600 text-xs">
        Try any CSV — sales data, time series, survey results…
      </p>
    </div>
  );
}
