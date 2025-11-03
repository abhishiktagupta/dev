/**
 * Chart utility functions for data processing and visualization
 */

export type Bucket = { timestamp: string; count: number };

export type PathData = {
  path: Array<{ cmd: 'M' | 'L'; x: number; y: number }>;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type AxisLabel = {
  value: number;
  label: string;
  x: number;
};

const HOURS_24 = 24 * 60 * 60 * 1000;

/**
 * Builds path data from buckets for SVG rendering
 */
export function buildPath(buckets: Bucket[]): PathData {
  if (!buckets?.length) return { path: [], minX: 0, maxX: 0, minY: 0, maxY: 0 };
  
  const valid = buckets.filter(b => !isNaN(new Date(b.timestamp).getTime()));
  if (!valid.length) return { path: [], minX: 0, maxX: 0, minY: 0, maxY: 0 };
  
  const xs = valid.map(b => new Date(b.timestamp).getTime());
  const ys = valid.map(b => b.count);
  
  return {
    path: valid.map((b, i) => ({ 
      cmd: i === 0 ? 'M' : 'L', 
      x: new Date(b.timestamp).getTime(), 
      y: b.count 
    })),
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: 0,
    maxY: Math.max(1, Math.max(...ys))
  };
}

/**
 * Generates X-axis labels based on time range
 */
export function generateAxisLabels(
  minX: number, 
  maxX: number, 
  is24HoursOrLess: boolean, 
  scaleX: (x: number) => number,
  formatTimeWithSeconds: (date: Date) => string
): AxisLabel[] {
  const labels: AxisLabel[] = [];
  const start = new Date(minX);
  const end = new Date(maxX);
  
  if (!is24HoursOrLess) {
    const addDate = (d: Date) => {
      const month = d.toLocaleDateString(undefined, { month: 'short' });
      const day = d.toLocaleDateString(undefined, { day: 'numeric' });
      labels.push({ value: d.getTime(), label: `${month} ${day}`, x: scaleX(d.getTime()) });
    };
    
    addDate(start);
    const current = new Date(start);
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
    
    while (current < end) {
      if (current.getTime() >= minX && current.getTime() <= maxX) addDate(current);
      current.setDate(current.getDate() + 1);
    }
    if (maxX !== minX) addDate(end);
  } else {
    const addTime = (d: Date) => labels.push({ 
      value: d.getTime(), 
      label: formatTimeWithSeconds(d), 
      x: scaleX(d.getTime()) 
    });
    
    addTime(start);
    let current = new Date(start);
    current.setMilliseconds(0);
    current = new Date(current.getTime() + 1000);
    
    while (current.getTime() < maxX) {
      if (current.getTime() > minX) addTime(current);
      current = new Date(current.getTime() + 1000);
    }
    if (maxX !== minX && !labels.some(l => l.value === maxX)) addTime(end);
  }
  
  labels.sort((a, b) => a.x - b.x);
  const minSpacing = is24HoursOrLess ? 30 : 80;
  const filtered: AxisLabel[] = [labels[0]];
  
  for (let i = 1; i < labels.length - 1; i++) {
    if (labels[i].x - filtered[filtered.length - 1].x >= minSpacing) filtered.push(labels[i]);
  }
  
  const last = labels[labels.length - 1];
  if (last && last.value !== filtered[filtered.length - 1]?.value) {
    if (last.x - filtered[filtered.length - 1].x < minSpacing * 0.5 && filtered.length > 1) filtered.pop();
    filtered.push(last);
  }
  
  return filtered.length ? filtered : labels;
}

/**
 * Checks if time difference is 24 hours or less
 */
export function is24HoursOrLess(minX: number, maxX: number): boolean {
  return (maxX - minX) <= HOURS_24;
}

/**
 * Generates chart description for accessibility
 */
export function generateChartDescription(buckets: Bucket[]): string {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const avg = buckets.length > 0 ? Math.round(total / buckets.length) : 0;
  const max = Math.max(...buckets.map(b => b.count));
  return `Time series chart showing ${buckets.length} data points. Total events: ${total}, Average: ${avg}, Maximum: ${max}. Use arrow keys to navigate data points.`;
}

