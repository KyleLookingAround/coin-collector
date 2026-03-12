/**
 * Detects column types from parsed data rows.
 * Returns: 'numeric' | 'datetime' | 'categorical'
 */

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}(T|\s|$)/,       // ISO 8601
  /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/,     // MM/DD/YYYY or MM-DD-YYYY
  /^\d{4}[\/\-]\d{2}[\/\-]\d{2}/,     // YYYY/MM/DD
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d/i,
  /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
];

function isDateLike(value) {
  const str = String(value).trim();
  if (!str) return false;
  if (DATE_PATTERNS.some((p) => p.test(str))) {
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  return false;
}

function isNumeric(value) {
  if (value === null || value === undefined || value === '') return false;
  const str = String(value).trim().replace(/,/g, '');
  return str !== '' && !isNaN(Number(str));
}

/**
 * Sample up to N rows to infer type of a column.
 */
function inferColumnType(values) {
  const sample = values.filter((v) => v !== null && v !== undefined && v !== '').slice(0, 100);
  if (sample.length === 0) return 'categorical';

  const numericCount = sample.filter(isNumeric).length;
  const dateCount = sample.filter(isDateLike).length;

  const ratio = (count) => count / sample.length;

  if (ratio(dateCount) >= 0.7) return 'datetime';
  if (ratio(numericCount) >= 0.7) return 'numeric';
  return 'categorical';
}

/**
 * Given an array of row objects, return { columnName: type } map.
 */
export function detectTypes(rows) {
  if (!rows || rows.length === 0) return {};
  const columns = Object.keys(rows[0]);
  const types = {};
  for (const col of columns) {
    const values = rows.map((r) => r[col]);
    types[col] = inferColumnType(values);
  }
  return types;
}

/**
 * Compute summary stats for a numeric column.
 */
export function computeStats(rows, column) {
  const values = rows
    .map((r) => {
      const v = String(r[column] ?? '').trim().replace(/,/g, '');
      return v !== '' ? Number(v) : NaN;
    })
    .filter((v) => !isNaN(v));

  if (values.length === 0) return { min: null, max: null, avg: null, sum: null, count: 0 };

  const sum = values.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    sum,
    count: values.length,
  };
}

/**
 * Parse a value to a number (returns NaN if not parseable).
 */
export function toNumber(value) {
  const str = String(value ?? '').trim().replace(/,/g, '');
  return str !== '' ? Number(str) : NaN;
}
