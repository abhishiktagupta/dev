import { useMemo, useCallback } from 'react';

type Bucket = { timestamp: string; count: number };

export default function TimeSeriesChart({ buckets }: { buckets: Bucket[] }) {
  const { path, minX, maxX, minY, maxY } = useMemo(() => buildPath(buckets), [buckets]);
  if (!buckets.length) return null;
  const padding = 20;
  const w = 800;
  const h = 280;

  // Memoize scale functions to prevent recreation on every render
  const scaleX = useCallback(
    (x: number) => padding + ((x - minX) / Math.max(1, maxX - minX)) * (w - padding * 2),
    [minX, maxX]
  );

  const scaleY = useCallback(
    (y: number) => h - padding - ((y - minY) / Math.max(1, maxY - minY)) * (h - padding * 2),
    [minY, maxY]
  );

  // Memoize path string generation
  const d = useMemo(
    () => path.map(p => `${p.cmd} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' '),
    [path, scaleX, scaleY]
  );

  return (
    <div className="panel">
      <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Time series chart">
        <rect x="0" y="0" width={w} height={h} fill="var(--bg-tertiary)" rx="12" />
        <path d={d} stroke="var(--zscaler-cyan)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="chart-legend">{new Date(minX).toLocaleDateString()} — {new Date(maxX).toLocaleDateString()}</div>
    </div>
  );
}

function buildPath(buckets: Bucket[]) {
  const xs = buckets.map(b => new Date(b.timestamp).getTime());
  const ys = buckets.map(b => b.count);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = 0;
  const maxY = Math.max(1, Math.max(...ys));
  const path = buckets.map((b, i) => ({
    cmd: i === 0 ? 'M' : 'L',
    x: new Date(b.timestamp).getTime(),
    y: b.count
  }));
  return { path, minX, maxX, minY, maxY };
}
