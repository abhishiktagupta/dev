import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { buildPath, generateAxisLabels, is24HoursOrLess, generateChartDescription, type Bucket, type AxisLabel } from '../utils/chartUtils';
import { formatTimeWithSeconds, formatTimeRangeLegend } from '../utils/dateUtils';

type TimeRange = { start: string; end: string };
type Point = { x: number; y: number; bucket: Bucket };

const PADDING = 60;
const LEFT_PADDING = 80;
const HEIGHT = 280;

export default function TimeSeriesChart({ buckets, timeRange }: { buckets: Bucket[]; timeRange: TimeRange }) {
  const { path, minX, maxX, minY, maxY } = useMemo(() => buildPath(buckets), [buckets]);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
  const is24HoursOrLessValue = is24HoursOrLess(minX, maxX);
  const bottomPadding = is24HoursOrLessValue ? 80 : 60;
  const chartHeight = HEIGHT - PADDING - bottomPadding;

  const scaleX = useCallback((x: number) => LEFT_PADDING + ((x - minX) / Math.max(1, maxX - minX)) * chartWidth, [minX, maxX, chartWidth]);
  const scaleY = useCallback((y: number) => PADDING + chartHeight - ((y - minY) / Math.max(1, maxY - minY)) * chartHeight, [minY, maxY, chartHeight]);

  useEffect(() => {
    if (selectedIndex !== null && buckets.length > 0) {
      const b = buckets[selectedIndex];
      setHoveredPoint({ x: scaleX(new Date(b.timestamp).getTime()), y: scaleY(b.count), bucket: b });
    }
  }, [selectedIndex, buckets, scaleX, scaleY]);

  const xAxisLabels = useMemo(() => generateAxisLabels(minX, maxX, is24HoursOrLessValue, scaleX, formatTimeWithSeconds), [minX, maxX, is24HoursOrLessValue, scaleX]);
  const yAxisLabels = useMemo(() => {
    const step = (maxY - minY) / 4;
    return Array.from({ length: 5 }, (_, i) => {
      const value = minY + step * i;
      return { value, label: Math.round(value).toString(), y: scaleY(value) };
    });
  }, [minY, maxY, scaleY]);

  const pathString = useMemo(() => path.map(p => `${p.cmd} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' '), [path, scaleX, scaleY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !buckets.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * w;
    const mouseY = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    
    let closest: Point | null = null;
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!buckets.length) return;
    const key = e.key;
    
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev === null ? 0 : prev < buckets.length - 1 ? prev + 1 : prev);
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev === null ? buckets.length - 1 : prev > 0 ? prev - 1 : prev);
    } else if (key === 'Home') {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (key === 'End') {
      e.preventDefault();
      setSelectedIndex(buckets.length - 1);
    } else if (key === 'Escape') {
      setSelectedIndex(null);
      setHoveredPoint(null);
    }
  }, [buckets]);

  const formatLegend = useMemo(() => formatTimeRangeLegend(timeRange.start, timeRange.end), [timeRange]);
  const chartDescription = useMemo(() => generateChartDescription(buckets), [buckets]);

  const selectedBucket = selectedIndex !== null ? buckets[selectedIndex] : null;
  const selectedPoint: Point | null = selectedBucket ? {
    x: scaleX(new Date(selectedBucket.timestamp).getTime()),
    y: scaleY(selectedBucket.count),
    bucket: selectedBucket
  } : null;
  const displayPoint = hoveredPoint || selectedPoint;

  const renderXAxisLabel = (label: AxisLabel, i: number) => {
    const parts = label.label.split(' ');
    const isDate = parts.length > 1;
    const isRotated = is24HoursOrLessValue && !isDate;
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
  };

  const renderTooltip = (point: Point) => {
    const tooltipY = point.y < 100 ? -60 : 15;
    const timestampStr = new Date(point.bucket.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return (
      <g transform={`translate(${point.x}, ${point.y})`} role="tooltip">
        <rect x="-70" y={tooltipY} width="140" height="45" fill="var(--bg-primary)" stroke="var(--border-primary)" rx="4" opacity="0.95" filter="drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))" />
        <text x="0" y={tooltipY + 18} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="600">{timestampStr}</text>
        <text x="0" y={tooltipY + 32} fill="var(--zscaler-cyan)" fontSize="11" textAnchor="middle" fontWeight="600">{point.bucket.count} events</text>
      </g>
    );
  };

  return (
    <div className="panel chart-container" ref={containerRef}>
      <div className="sr-only" id="chart-description">{chartDescription}</div>
      <svg 
        ref={svgRef}
        className="chart" 
        viewBox={`0 0 ${w} ${HEIGHT}`} 
        preserveAspectRatio="xMidYMid meet"
        role="img" 
        aria-label="Time series chart"
        aria-describedby="chart-description"
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => selectedIndex === null && setHoveredPoint(null)}
        onKeyDown={handleKeyDown}
        onFocus={() => selectedIndex === null && buckets.length > 0 && setSelectedIndex(0)}
        style={{ width: '100%', height: 'auto' }}
      >
        <rect x="0" y="0" width={w} height={HEIGHT} fill="var(--bg-tertiary)" rx="12" />
        <line x1={LEFT_PADDING} y1={HEIGHT - bottomPadding} x2={w - PADDING} y2={HEIGHT - bottomPadding} stroke="var(--border-primary)" strokeWidth="1" />
        <line x1={LEFT_PADDING} y1={PADDING} x2={LEFT_PADDING} y2={HEIGHT - bottomPadding} stroke="var(--border-primary)" strokeWidth="1" />
        
        {xAxisLabels.map(renderXAxisLabel)}
        
        {yAxisLabels.map((label, i) => (
          <g key={i}>
            <line x1={LEFT_PADDING} y1={label.y} x2={LEFT_PADDING - 5} y2={label.y} stroke="var(--border-primary)" strokeWidth="1" />
            <text x={LEFT_PADDING - 10} y={label.y + 4} fill="var(--text-primary)" fontSize="11" textAnchor="end" className="chart-axis-label">{label.label}</text>
          </g>
        ))}
        
        <text x="15" y={HEIGHT / 2} fill="var(--text-primary)" fontSize="12" textAnchor="middle" className="chart-axis-label" transform={`rotate(-90, 15, ${HEIGHT / 2})`} fontWeight="500">No of events</text>
        <path d={pathString} stroke="var(--zscaler-cyan)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-label="Chart line showing event count over time" />
        
        {displayPoint && (
          <g role="presentation">
            <circle 
              cx={displayPoint.x} 
              cy={displayPoint.y} 
              r="5" 
              fill="var(--zscaler-cyan)" 
              stroke="var(--bg-tertiary)" 
              strokeWidth="2"
              aria-label={`Selected data point: ${displayPoint.bucket.count} events at ${new Date(displayPoint.bucket.timestamp).toLocaleString()}`}
            />
            {renderTooltip(displayPoint)}
          </g>
        )}
      </svg>
      
      <div className="chart-legend" aria-label={`Time range: ${formatLegend}`}>{formatLegend}</div>
      
      {selectedPoint && (
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Selected: {selectedPoint.bucket.count} events at {new Date(selectedPoint.bucket.timestamp).toLocaleString()}. Point {selectedIndex !== null ? selectedIndex + 1 : 0} of {buckets.length}.
        </div>
      )}
    </div>
  );
}
