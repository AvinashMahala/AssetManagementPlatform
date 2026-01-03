export function jsonToCsv(rows: any[], columns?: string[]) {
  if (!rows || rows.length === 0) return '';

  const keys = columns || Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = keys.join(',');
  const lines = rows.map(r => keys.map(k => escape(r[k])).join(','));
  return [header, ...lines].join('\n');
}