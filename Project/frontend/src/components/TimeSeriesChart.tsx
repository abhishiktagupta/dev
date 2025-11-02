import { useMemo, useCallback, useState, useRef, useEffect } from 'react';

type Bucket = { timestamp: string; count: number };
type TimeRange = { start: string; end: string };

const PADDING = 60;
const LEFT_PADDING = 80;
const HEIGHT = 280;
const HOURS_24 = 24 * 60 * 60 * 1000;

export default function TimeSeriesChart({ buckets, timeRange }: { buckets: Bucket[]; timeRange: TimeRange }) {
  const { path, minX, maxX, minY, maxY } = useMemo(() => buildPath(buckets), [buckets]);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; bucket: Bucket } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  
  useEffect(() => {
    const updateWidth = () => containerRef.current && setContainerWidth(containerRef.current.offsetWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  if (!buckets.length) return null;
  
  const w = containerWidth;
  const chartWidth = w - PADDING - LEFT_PADDING;
  const timeDiff = maxX - minX;
  const is24HoursOrLess = timeDiff <= HOURS_24;
  const bottomPadding = is24HoursOrLess ? 80 : 60;
  const chartHeight = HEIGHT - PADDING - bottomPadding;

  const scaleX = (x: number) => LEFT_PADDING + ((x - minX) / Math.max(1, maxX - minX)) * chartWidth;
  const scaleY = (y: number) => PADDING + chartHeight - ((y - minY) / Math.max(1, maxY - minY)) * chartHeight;

  const xAxisLabels = useMemo(() => {
    const labels: { value: number; label: string; x: number }[] = [];
    const startDate = new Date(minX);
    const endDate = new Date(maxX);
    
    if (!is24HoursOrLess) {
      // Date labels for >24 hours
      const addDateLabel = (date: Date) => {
        const month = date.toLocaleDateString(undefined, { month: 'short' });
        const day = date.toLocaleDateString(undefined, { day: 'numeric' });
        labels.push({ value: date.getTime(), label: `${month} ${day}`, x: scaleX(date.getTime()) });
      };
      
      addDateLabel(startDate);
      const current = new Date(startDate);
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      
      while (current < endDate) {
        if (current.getTime() >= minX && current.getTime() <= maxX) addDateLabel(current);
        current.setDate(current.getDate() + 1);
      }
      
      if (maxX !== minX) addDateLabel(endDate);
    } else {
      // Time labels with seconds for <=24 hours
      const addTimeLabel = (date: Date) => {
        labels.push({ value: date.getTime(), label: formatTimeWithSeconds(date), x: scaleX(date.getTime()) });
      };
      
      addTimeLabel(startDate);
      let current = new Date(startDate);
      current.setMilliseconds(0);
      current = new Date(current.getTime() + 1000);
      
      while (current.getTime() < maxX) {
        if (current.getTime() > minX) addTimeLabel(current);
        current = new Date(current.getTime() + 1000);
      }
      
      if (maxX !== minX && !labels.some(l => l.value === maxX)) addTimeLabel(endDate);
    }
    
    labels.sort((a, b) => a.x - b.x);
    const minSpacing = is24HoursOrLess ? 30 : 80;
    const filtered: typeof labels = [labels[0]];
    
    for (let i = 1; i < labels.length - 1; i++) {
      if (labels[i].x - filtered[filtered.length - 1].x >= minSpacing) filtered.push(labels[i]);
    }
    
    const last = labels[labels.length - 1];
    if (last && last.value !== filtered[filtered.length - 1]?.value) {
      if (last.x - filtered[filtered.length - 1].x < minSpacing * 0.5 && filtered.length > 1) filtered.pop();
      filtered.push(last);
    }
    
    return filtered.length ? filtered : labels;
  }, [minX, maxX, is24HoursOrLess, scaleX]);

  const yAxisLabels = useMemo(() => {
    const numLabels = 5;
    const step = (maxY - minY) / (numLabels - 1);
    return Array.from({ length: numLabels }, (_, i) => {
      const value = minY + step * i;
      return { value, label: Math.round(value).toString(), y: scaleY(value) };
    });
  }, [minY, maxY, scaleY]);

  const pathString = useMemo(
    () => path.map(p => `${p.cmd} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' '),
    [path, scaleX, scaleY]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !buckets.length) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * w;
    const mouseY = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    
    let closest: { x: number; y: number; bucket: Bucket } | null = null;
    let minDist = Infinity;
    
    buckets.forEach((bucket) => {
      const x = scaleX(new Date(bucket.timestamp).getTime());
      const y = scaleY(bucket.count);
      const dist = Math.hypot(mouseX - x, mouseY - y);
      
      if (dist < minDist && dist < 40) {
        minDist = dist;
        closest = { x, y, bucket };
      }
    });
    
    setHoveredPoint(closest);
  }, [buckets, scaleX, scaleY, w]);

  const formatLegend = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `${fmt(new Date(timeRange.start))} — ${fmt(new Date(timeRange.end))}`;
  }, [timeRange]);

  return (
    <div className="panel chart-container" ref={containerRef}>
      <svg 
        ref={svgRef}
        className="chart" 
        viewBox={`0 0 ${w} ${HEIGHT}`} 
        preserveAspectRatio="xMidYMid meet"
        role="img" 
        aria-label="Time series chart"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        style={{ width: '100%', height: 'auto' }}
      >
        <rect x="0" y="0" width={w} height={HEIGHT} fill="var(--bg-tertiary)" rx="12" />
        <line x1={LEFT_PADDING} y1={HEIGHT - bottomPadding} x2={w - PADDING} y2={HEIGHT - bottomPadding} stroke="var(--border-primary)" strokeWidth="1" />
        <line x1={LEFT_PADDING} y1={PADDING} x2={LEFT_PADDING} y2={HEIGHT - bottomPadding} stroke="var(--border-primary)" strokeWidth="1" />
        
        {xAxisLabels.map((label, i) => {
          const parts = label.label.split(' ');
          const isDate = parts.length > 1;
          const isRotated = is24HoursOrLess && !isDate;
          const yBase = HEIGHT - bottomPadding;
          
          return (
            <g key={i}>
              <line x1={label.x} y1={yBase} x2={label.x} y2={yBase + 5} stroke="var(--border-primary)" strokeWidth="1" />
              {isDate ? (
                <g>
                  <text x={label.x} y={yBase + 12} fill="var(--text-primary)" fontSize="11" textAnchor="middle" className="chart-axis-label" fontWeight="500" dominantBaseline="hanging">{parts[1]}</text>
                  <text x={label.x} y={yBase + 26} fill="var(--text-secondary)" fontSize="9" textAnchor="middle" className="chart-axis-label" dominantBaseline="hanging">{parts[0]}</text>
                </g>
              ) : isRotated ? (
                <g transform={`translate(${label.x}, ${yBase + 15}) rotate(-45)`}>
                  <text x="0" y="0" fill="var(--text-primary)" fontSize="9" textAnchor="start" className="chart-axis-label-x" dominantBaseline="middle">{label.label}</text>
                </g>
              ) : (
                <text x={label.x} y={yBase + 20} fill="var(--text-primary)" fontSize="11" textAnchor="middle" className="chart-axis-label" dominantBaseline="hanging">{label.label}</text>
              )}
            </g>
          );
        })}
        
        {yAxisLabels.map((label, i) => (
          <g key={i}>
            <line x1={LEFT_PADDING} y1={label.y} x2={LEFT_PADDING - 5} y2={label.y} stroke="var(--border-primary)" strokeWidth="1" />
            <text x={LEFT_PADDING - 10} y={label.y + 4} fill="var(--text-primary)" fontSize="11" textAnchor="end" className="chart-axis-label">{label.label}</text>
          </g>
        ))}
        <text x="15" y={HEIGHT / 2} fill="var(--text-primary)" fontSize="12" textAnchor="middle" className="chart-axis-label" transform={`rotate(-90, 15, ${HEIGHT / 2})`} fontWeight="500">No of events</text>
        <path d={pathString} stroke="var(--zscaler-cyan)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {hoveredPoint && (
          <g>
            <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill="var(--zscaler-cyan)" stroke="var(--bg-tertiary)" strokeWidth="2" />
            {(() => {
              const tooltipY = hoveredPoint.y < 100 ? -60 : 15;
              return (
                <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y})`}>
                  <rect x="-70" y={tooltipY} width="140" height="45" fill="var(--bg-primary)" stroke="var(--border-primary)" rx="4" opacity="0.95" filter="drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))" />
                  <text x="0" y={tooltipY + 18} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="600">
                    {new Date(hoveredPoint.bucket.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </text>
                  <text x="0" y={tooltipY + 32} fill="var(--zscaler-cyan)" fontSize="11" textAnchor="middle" fontWeight="600">{hoveredPoint.bucket.count} events</text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
      <div className="chart-legend">{formatLegend}</div>
    </div>
  );
}

function formatTimeWithSeconds(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function buildPath(buckets: Bucket[]) {
  if (!buckets?.length) return { path: [], minX: 0, maxX: 0, minY: 0, maxY: 0 };
  
  const validBuckets = buckets.filter(b => !isNaN(new Date(b.timestamp).getTime()));
  if (!validBuckets.length) return { path: [], minX: 0, maxX: 0, minY: 0, maxY: 0 };
  
  const xs = validBuckets.map(b => new Date(b.timestamp).getTime());
  const ys = validBuckets.map(b => b.count);
  
  return {
    path: validBuckets.map((b, i) => ({ cmd: i === 0 ? 'M' : 'L', x: new Date(b.timestamp).getTime(), y: b.count })),
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: 0,
    maxY: Math.max(1, Math.max(...ys))
  };
}
