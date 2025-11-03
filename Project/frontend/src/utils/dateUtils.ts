/**
 * Date utility functions for converting between formats
 */

/**
 * Converts ISO date string to datetime-local input format (YYYY-MM-DDTHH:mm)
 */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

/**
 * Converts datetime-local string to ISO UTC string
 */
export function toUTC(local: string): string {
  const d = new Date(local);
  return d.toISOString();
}

/**
 * Formats a date to HH:MM:SS format
 */
export function formatTimeWithSeconds(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Formats date range for legend display
 */
export function formatTimeRangeLegend(start: string, end: string): string {
  const fmt = (d: Date) => d.toLocaleString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${fmt(new Date(start))} — ${fmt(new Date(end))}`;
}

