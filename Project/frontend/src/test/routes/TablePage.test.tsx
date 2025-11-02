import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../utils';
import TablePage from '../../routes/TablePage';
import type { EventItem } from '../../components/DataTable';

// Mock the lazy loaded component
jest.mock('../../components/DataTable', () => {
  return {
    __esModule: true,
    default: ({ items, onOpenSettings }: { items: EventItem[]; onOpenSettings?: () => void }) => (
      <div data-testid="data-table">
        {items.length > 0 ? (
          <div data-testid="item-count">{items.length} items</div>
        ) : (
          <p className="table-empty-message">No matching events.</p>
        )}
        {onOpenSettings && (
          <button onClick={onOpenSettings} data-testid="open-settings">
            Open Settings
          </button>
        )}
      </div>
    ),
    EventItem: {} as EventItem
  };
});

// Mock useFetch hook
jest.mock('../../hooks/useFetch', () => ({
  useFetch: jest.fn()
}));

import { useFetch } from '../../hooks/useFetch';

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch>;

const mockItems: EventItem[] = [
  {
    id: '1',
    timestamp: '2021-07-26T10:00:00.000Z',
    type: 'malware',
    attacker: { id: 'attacker-1', ip: '192.168.1.1', name: 'Attacker One' },
    decoy: { name: 'Decoy One' },
    severity: 'High'
  }
];

describe('TablePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error message when fetch fails', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error')
    });

    customRender(<TablePage />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    customRender(<TablePage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no items', async () => {
    mockUseFetch.mockReturnValue({
      data: { items: [], page: 1, pageSize: 5, total: 0, totalPages: 0 },
      loading: false,
      error: null
    });

    customRender(<TablePage />);
    
    // Wait for Suspense to resolve and DataTable to render
    await screen.findByTestId('data-table');
    
    expect(screen.getByText('No matching events.')).toBeInTheDocument();
  });

  it('renders data table when data is available', async () => {
    mockUseFetch.mockReturnValue({
      data: {
        items: mockItems,
        page: 1,
        pageSize: 5,
        total: 1,
        totalPages: 1
      },
      loading: false,
      error: null
    });

    customRender(<TablePage />);

    const dataTable = await screen.findByTestId('data-table');
    expect(dataTable).toBeInTheDocument();
    
    const itemCount = within(dataTable).getByTestId('item-count');
    expect(itemCount).toHaveTextContent('1 items');
  });

  it('opens settings modal when settings button is clicked', async () => {
    const user = userEvent.setup();
    mockUseFetch.mockReturnValue({
      data: {
        items: mockItems,
        page: 1,
        pageSize: 5,
        total: 1,
        totalPages: 1
      },
      loading: false,
      error: null
    });

    customRender(<TablePage />);

    const dataTable = await screen.findByTestId('data-table');
    const settingsButton = within(dataTable).getByTestId('open-settings');
    
    await user.click(settingsButton);

    const modal = await screen.findByRole('dialog', { name: /column settings/i });
    expect(modal).toBeInTheDocument();
  });

  it('shows updating message when loading with existing data', () => {
    mockUseFetch.mockReturnValue({
      data: {
        items: mockItems,
        page: 1,
        pageSize: 5,
        total: 1,
        totalPages: 1
      },
      loading: true,
      error: null
    });

    customRender(<TablePage />);
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('constructs correct URL with query parameters', () => {
    mockUseFetch.mockReturnValue({
      data: null,
      loading: false,
      error: null
    });

    customRender(<TablePage />);

    expect(mockUseFetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:4002/events'),
      expect.anything()
    );
  });
});

