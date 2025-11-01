import express from 'express';
import cors from 'cors';
import { loadEvents } from './lib/dataLoader';
import { CountBucket } from './types';

const app = express();
app.use(cors());

function toDateOnlyISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}T00:00:00.000Z`;
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/events/count', (req, res) => {
  try {
    const startStr = String(req.query.start || '');
    const endStr = String(req.query.end || '');
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;

    const events = loadEvents().filter(e => {
      const t = new Date(e.timestamp).getTime();
      if (Number.isNaN(t)) return false;
      if (start && t < start.getTime()) return false;
      if (end && t > end.getTime()) return false;
      return true;
    });

    const map = new Map<string, number>();
    for (const ev of events) {
      const key = toDateOnlyISO(new Date(ev.timestamp));
      map.set(key, (map.get(key) || 0) + 1);
    }

    const buckets: CountBucket[] = Array.from(map.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const total = events.length;
    res.json({ buckets, total });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`graph-service running on http://localhost:${PORT}`);
  }
});
