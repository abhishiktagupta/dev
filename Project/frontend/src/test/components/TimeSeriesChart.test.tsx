import { render, screen } from '@testing-library/react';
import TimeSeriesChart from '../../components/TimeSeriesChart';

describe('TimeSeriesChart', () => {
  const mockBuckets = [
    { timestamp: '2021-07-26T00:00:00.000Z', count: 10 },
    { timestamp: '2021-07-27T00:00:00.000Z', count: 20 },
    { timestamp: '2021-07-28T00:00:00.000Z', count: 15 },
  ];

  it('does not render when buckets array is empty', () => {
    const { container } = render(<TimeSeriesChart buckets={[]} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('img', { name: /time series chart/i })).not.toBeInTheDocument();
  });

  it('renders chart SVG when buckets are provided', () => {
    render(<TimeSeriesChart buckets={mockBuckets} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });

  it('renders chart with correct viewBox', () => {
    render(<TimeSeriesChart buckets={mockBuckets} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toHaveAttribute('viewBox', '0 0 800 280');
  });

  it('renders chart legend with date range', () => {
    render(<TimeSeriesChart buckets={mockBuckets} />);
    
    const legend = screen.getByText(/—/); // Date range separator
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveClass('chart-legend');
  });

  it('renders path element for chart line', () => {
    render(<TimeSeriesChart buckets={mockBuckets} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    const path = svg.querySelector('path[stroke]');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('stroke', expect.stringContaining('cyan'));
  });

  it('renders background rect', () => {
    render(<TimeSeriesChart buckets={mockBuckets} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    const rect = svg.querySelector('rect[fill]');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('rx', '12');
  });

  it('handles single bucket', () => {
    const singleBucket = [{ timestamp: '2021-07-26T00:00:00.000Z', count: 10 }];
    render(<TimeSeriesChart buckets={singleBucket} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
  });

  it('handles buckets with zero count', () => {
    const bucketsWithZero = [
      { timestamp: '2021-07-26T00:00:00.000Z', count: 0 },
      { timestamp: '2021-07-27T00:00:00.000Z', count: 5 },
    ];
    render(<TimeSeriesChart buckets={bucketsWithZero} />);
    
    const svg = screen.getByRole('img', { name: /time series chart/i });
    expect(svg).toBeInTheDocument();
  });
});

