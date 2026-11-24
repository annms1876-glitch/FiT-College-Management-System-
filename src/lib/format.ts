export const inr = (value: number, fractionDigits = 0) =>
  `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)}`;

export const num = (value: number) => new Intl.NumberFormat('en-IN').format(value);

export const compactInr = (value: number) => {
  if (Math.abs(value) >= 1_00_00_000) {
    const cr = value / 1_00_00_000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (Math.abs(value) >= 1_00_000) {
    const l = value / 1_00_000;
    return `₹${l.toFixed(2).replace(/\.00$/, '')} L`;
  }
  return inr(value);
};

export const pct = (value: number, digits = 1) =>
  `${Number(value).toFixed(digits).replace(/\.0$/, '')}%`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Accepts ISO (YYYY-MM-DD) or Date and renders DD MMM YYYY. */
export const fmtDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return `${fmtDate(d)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const fmtTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** dd/mm/yyyy — used for official receipts / KYC tables. */
export const fmtDateSlashed = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (fromISO: string, toISO = todayISO()) => {
  const a = new Date(`${fromISO}T00:00:00`).getTime();
  const b = new Date(`${toISO}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
};

export const ordinalSem = (sem: number) => {
  const suffix = sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th';
  return `${sem}${suffix} Sem`;
};

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
