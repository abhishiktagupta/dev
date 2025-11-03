import express from 'express';
import cors from 'cors';
import { loadEvents } from './lib/dataLoader';
import { EventItem, TableResponse } from './types';

const app = express();
app.use(cors());

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * Handles timestamp filtering by matching against multiple date format representations
 * Supports: ISO, YYYY-MM-DD, MM/DD, DD/MM/YYYY, etc.
 */
function matchesTimestampFilter(timestamp: string, searchValue: string): boolean {
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return false;

    const search = searchValue.trim().toLowerCase();
    if (!search) return true;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthPadded = String(month).padStart(2, '0');
    const day = date.getDate();
    const dayPadded = String(day).padStart(2, '0');

    // Generate all common date format representations
    const formats = [
      timestamp,                              // Original ISO: 2021-08-24T13:06:44Z
      `${year}-${monthPadded}-${dayPadded}`, // 2021-08-24
      `${year}-${monthPadded}`,              // 2021-08
      `${monthPadded}/${dayPadded}`,         // 08/24 (MM/DD)
      `${month}/${day}`,                     // 8/24
      `${monthPadded}/`,                     // 08/
      `${dayPadded}/${monthPadded}/${year}`, // 24/08/2021 (DD/MM/YYYY)
      `${day}/${month}/${year}`,             // 24/8/2021
      `${dayPadded}/${monthPadded}`,         // 24/08 (DD/MM)
      `${day}/${month}`,                     // 24/8
      `${year}/${monthPadded}/${dayPadded}`, // 2021/08/24
      `${year}/${monthPadded}`,              // 2021/08
    ];

    // Simple check: see if search value appears in any format
    return formats.some(format => format.toLowerCase().includes(search));
  } catch {
    return false;
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/events', (req, res) => {
  try {
    const startStr = String(req.query.start || '');
    const endStr = String(req.query.end || '');
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '20'), 10)));

    const sortParam = String(req.query.sort || 'timestamp:desc');
    const [sortField = 'timestamp', sortDir = 'desc'] = sortParam.split(':');

    const filtersParam = String(req.query.filters || '');
    const filters: Array<{ field: string; value: string }> = filtersParam
      ? filtersParam.split(',').map(p => {
          const colonIndex = p.indexOf(':');
          if (colonIndex === -1) return null;
          const field = p.substring(0, colonIndex).trim();
          const value = p.substring(colonIndex + 1).trim();
          return field && value ? { field, value } : null;
        }).filter((f): f is { field: string; value: string } => f !== null)
      : [];

    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;

    let items: EventItem[] = loadEvents().filter(e => {
      const t = new Date(e.timestamp).getTime();
      if (Number.isNaN(t)) return false;
      if (start && t < start.getTime()) return false;
      if (end && t > end.getTime()) return false;
      return true;
    });

    if (filters.length) {
      items = items.filter(item =>
        filters.every(({ field, value }) => {
          if (!value || !value.trim()) return true; // Empty filter means no filter
          const v = getByPath(item, field);
          if (v === undefined || v === null) return false;
          
          // Special handling for timestamp fields to support various date formats
          if (field === 'timestamp') {
            return matchesTimestampFilter(String(v), String(value));
          }
          
          // Default string matching for other fields
          const fieldValue = String(v).toLowerCase().trim();
          const searchValue = String(value).toLowerCase().trim();
          return fieldValue.includes(searchValue);
        })
      );
    }

    items.sort((a, b) => {
      const av = getByPath(a, sortField);
      const bv = getByPath(b, sortField);
      let cmp = 0;
      if (sortField === 'timestamp') {
        cmp = new Date(av).getTime() - new Date(bv).getTime();
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const pageItems = items.slice(startIndex, startIndex + pageSize);

    const resp: TableResponse = { items: pageItems, page, pageSize, total, totalPages };
    res.json(resp);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT);
