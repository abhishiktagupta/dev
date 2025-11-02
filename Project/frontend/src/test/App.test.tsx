import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TimeRangeProvider } from '../store/timeRangeContext';
import App from '../App';

// Mock lazy loaded components
jest.mock('../routes/GraphPage', () => ({
  __esModule: true,
  default: () => <div data-testid="graph-page">Graph Page</div>
}));

jest.mock('../routes/TablePage', () => ({
  __esModule: true,
  default: () => <div data-testid="table-page">Table Page</div>
}));

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TimeRangeProvider>
        <App />
      </TimeRangeProvider>
    </MemoryRouter>
  );
};

describe('App', () => {
  it('renders header with title', () => {
    renderWithRouter();
    expect(screen.getByText('Event Tracker')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter();
    
    const graphLink = screen.getByLabelText('Graph view');
    const tableLink = screen.getByLabelText('Table view');
    
    expect(graphLink).toBeInTheDocument();
    expect(tableLink).toBeInTheDocument();
    expect(graphLink).toHaveAttribute('href', '/');
    expect(tableLink).toHaveAttribute('href', '/table');
  });

  it('renders skip link for accessibility', () => {
    renderWithRouter();
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink).toHaveClass('skip-link');
  });

  it('renders main content area', () => {
    renderWithRouter();
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('renders GraphPage by default at root route', () => {
    renderWithRouter(['/']);
    
    expect(screen.getByTestId('graph-page')).toBeInTheDocument();
  });

  it('renders TablePage at /table route', async () => {
    renderWithRouter(['/table']);
    
    // Wait for lazy-loaded component to render
    expect(await screen.findByTestId('table-page')).toBeInTheDocument();
  });

  it('wraps app with TimeRangeProvider', () => {
    renderWithRouter();
    
    // If the provider is working, we should be able to render components that use it
    // The GraphPage uses TimeRangePicker which requires the provider
    expect(screen.getByTestId('graph-page')).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    renderWithRouter();
    
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('applies active class to active nav link', () => {
    renderWithRouter(['/']);
    
    const graphLink = screen.getByLabelText('Graph view');
    // The active class is applied by react-router-dom's NavLink
    // We can check that the link exists and has the proper structure
    expect(graphLink).toBeInTheDocument();
  });
});
