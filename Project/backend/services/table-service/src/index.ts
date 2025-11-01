import express from 'express';
import cors from 'cors';
import { loadEvents } from './lib/dataLoader';
import { EventItem, TableResponse } from './types';

const app = express();
app.use(cors());

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, key) => (acc ? acc[key] : undefined), obj);
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
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`table-service running on http://localhost:${PORT}`);
  }
});
