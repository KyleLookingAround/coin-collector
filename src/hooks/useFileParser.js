import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { detectTypes } from '../utils/detectTypes';

/**
 * Returns { parseFile, data, error, loading }
 * data = { columns: string[], rows: object[], types: Record<string, 'numeric'|'datetime'|'categorical'>, fileName: string }
 */
export function useFileParser() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback((file) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let parsed = JSON.parse(e.target.result);
          // Support both array-of-objects and { data: [...] } shapes
          if (!Array.isArray(parsed)) {
            const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
            parsed = key ? parsed[key] : [parsed];
          }
          if (parsed.length === 0) throw new Error('JSON file is empty or has no rows.');
          const columns = Object.keys(parsed[0]);
          const types = detectTypes(parsed);
          setData({ columns, rows: parsed, types, fileName: file.name });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file.');
        setLoading(false);
      };
      reader.readAsText(file);
      return;
    }

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // keep as strings so our type detection is authoritative
        complete: (result) => {
          if (result.errors.length > 0 && result.data.length === 0) {
            setError(result.errors[0].message);
            setLoading(false);
            return;
          }
          const rows = result.data;
          if (rows.length === 0) {
            setError('CSV file is empty.');
            setLoading(false);
            return;
          }
          const columns = result.meta.fields ?? Object.keys(rows[0]);
          const types = detectTypes(rows);
          setData({ columns, rows, types, fileName: file.name });
          setLoading(false);
        },
        error: (err) => {
          setError(err.message);
          setLoading(false);
        },
      });
      return;
    }

    setError(`Unsupported file type: .${ext}. Please upload a .csv or .json file.`);
    setLoading(false);
  }, []);

  return { parseFile, data, error, loading };
}
