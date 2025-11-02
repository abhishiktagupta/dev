import { render, screen } from '@testing-library/react';
import Loading from '../../components/Loading';

describe('Loading', () => {
  it('renders default loading message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders custom loading label', () => {
    render(<Loading label="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toHaveClass('panel', 'loading');
  });

  it('has correct accessibility attributes', () => {
    render(<Loading />);
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });
});

