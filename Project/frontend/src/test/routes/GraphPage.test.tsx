import { render, screen, within } from '@testing-library/react';
import { render as customRender } from '../utils';
import GraphPage from '../../routes/GraphPage';

// Mock the lazy loaded component
jest.mock('../../components/TimeSeriesChart', () => {
  return {
    __esModule: true,
    default: ({ buckets }: { buckets: Array<{ timestamp: string; count: number }> }) => (
      <div data-testid="time-series-chart">{buckets.length} buckets</div>
    )
  };
});

// Mock useFetch hook
jest.mock('../../hooks/useFetch', () => ({
  useFetch: jest.fn()
}));

import { useFetch } from '../../hooks/useFetch';

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch>;

describe('GraphPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders TimeRangePicker', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: false,
      error: null
    });

    customRender(<GraphPage />);
    expect(screen.getByRole('group', { name: /time range/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    customRender(<GraphPage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch')
    });

    customRender(<GraphPage />);
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders chart when data is available', async () => {
    const mockData = {
      buckets: [
        { timestamp: '2021-07-26T00:00:00.000Z', count: 10 },
        { timestamp: '2021-07-27T00:00:00.000Z', count: 20 }
      ],
      total: 30
    };

    mockUseFetch.mockReturnValue({
      data: mockData,
      loading: false,
      error: null
    });

    customRender(<GraphPage />);

    const chart = await screen.findByTestId('time-series-chart');
    expect(chart).toBeInTheDocument();
    expect(within(chart).getByText('2 buckets')).toBeInTheDocument();
  });

  it('shows empty state when no buckets are available', () => {
    mockUseFetch.mockReturnValue({
      data: { buckets: [], total: 0 },
      loading: false,
      error: null
    });

    customRender(<GraphPage />);
    expect(screen.getByText('No events in the selected time range.')).toBeInTheDocument();
  });

  it('constructs correct URL with time range', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: false,
      error: null
    });

    customRender(<GraphPage />);

    expect(mockUseFetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:4001/events/count'),
      expect.arrayContaining([expect.any(Object)])
    );
  });
});

