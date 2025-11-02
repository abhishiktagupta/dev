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

function toSecondsISO(d: Date, intervalSeconds: number = 1): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const seconds = Math.floor(d.getUTCSeconds() / intervalSeconds) * intervalSeconds;
  const h = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${mm}:${ss}.000Z`;
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/events/count', (req, res) => {
  try {
    const startStr = String(req.query.start || '');
    const endStr = String(req.query.end || '');
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;

    // Validate dates
    if (start && isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }
    if (end && isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid end date' });
    }

    // Calculate time range to determine bucket size
    let bucketBySeconds = false;
    
    if (start && end) {
      const timeDiff = end.getTime() - start.getTime();
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (timeDiff > 0 && timeDiff <= hours24) {
        bucketBySeconds = true;
      }
    }

    // Load all events first
    const allEvents = loadEvents();

    // Filter events with the same logic as table service - inclusive boundaries
    let events = allEvents.filter(e => {
      const t = new Date(e.timestamp).getTime();
      if (Number.isNaN(t)) return false;
      // Use same logic as table service: exclude if before start or after end
      // Events at exactly start or end are included (inclusive)
      if (start && t < start.getTime()) return false;
      if (end && t > end.getTime()) return false;
      return true;
    });

    // If no events found, return empty result
    if (events.length === 0) {
      return res.json({ buckets: [], total: 0 });
    }

    const map = new Map<string, number>();
    for (const ev of events) {
      // Bucket based on time range: seconds for <= 24 hours, day for > 24 hours
      const eventDate = new Date(ev.timestamp);
      if (isNaN(eventDate.getTime())) continue; // Skip invalid dates
      
      const key = bucketBySeconds
        ? toSecondsISO(eventDate, 1)
        : toDateOnlyISO(eventDate);
      map.set(key, (map.get(key) || 0) + 1);
    }

    // Convert to buckets - all buckets are valid since events are already filtered correctly
    // The map only contains buckets for events that passed the time range filter
    const buckets: CountBucket[] = Array.from(map.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const total = events.length;
    res.json({ buckets, total });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Graph service error:', err);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT);
