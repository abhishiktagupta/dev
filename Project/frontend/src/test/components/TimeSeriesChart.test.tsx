import { render, screen } from '@testing-library/react';
import TimeSeriesChart from '../../components/TimeSeriesChart';

describe('TimeSeriesChart', () => {
  const mockBuckets = [
    { timestamp: '2021-07-26T00:00:00.000Z', count: 10 },
    { timestamp: '2021-07-27T00:00:00.000Z', count: 20 },
    { timestamp: '2021-07-28T00:00:00.000Z', count: 15 },
  ];

  const mockTimeRange = {
    start: '2021-07-26T00:00:00.000Z',
    end: '2021-07-28T00:00:00.000Z'
  };

  it('does not render when buckets array is empty', () => {
    const { container } = render(<TimeSeriesChart buckets={[]} timeRange={mockTimeRange} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('img', { name: /time series chart/i })).not.toBeInTheDocument();
  });

  it('renders chart SVG when buckets are provided', () => {
    render(<TimeSeriesChart buckets={mockBuckets} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });

  it('renders chart with correct viewBox', () => {
    // Mock container width for consistent testing
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 800,
    });
    
    render(<TimeSeriesChart buckets={mockBuckets} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    // Width is dynamic, just check that viewBox exists and has correct height
    expect(svg).toHaveAttribute('viewBox');
    expect(svg.getAttribute('viewBox')).toMatch(/^\d+ 0 \d+ 280$/);
  });

  it('renders chart legend with date range', () => {
    render(<TimeSeriesChart buckets={mockBuckets} timeRange={mockTimeRange} />);
    
    const legend = screen.getByText(/—/); // Date range separator
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveClass('chart-legend');
  });

  it('renders path element for chart line', () => {
    render(<TimeSeriesChart buckets={mockBuckets} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    const path = svg.querySelector('path[stroke]');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('stroke', expect.stringContaining('cyan'));
  });

  it('renders background rect', () => {
    render(<TimeSeriesChart buckets={mockBuckets} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    const rect = svg.querySelector('rect[fill]');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('rx', '12');
  });

  it('handles single bucket', () => {
    const singleBucket = [{ timestamp: '2021-07-26T00:00:00.000Z', count: 10 }];
    render(<TimeSeriesChart buckets={singleBucket} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
  });

  it('handles buckets with zero count', () => {
    const bucketsWithZero = [
      { timestamp: '2021-07-26T00:00:00.000Z', count: 0 },
      { timestamp: '2021-07-27T00:00:00.000Z', count: 5 },
    ];
    render(<TimeSeriesChart buckets={bucketsWithZero} timeRange={mockTimeRange} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
  });
});

