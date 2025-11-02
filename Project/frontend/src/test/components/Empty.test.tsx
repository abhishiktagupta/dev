import { render, screen } from '@testing-library/react';
import Empty from '../../components/Empty';

describe('Empty', () => {
  it('renders default empty message', () => {
    render(<Empty />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders custom empty message', () => {
    render(<Empty message="No events found" />);
    expect(screen.getByText('No events found')).toBeInTheDocument();
    const emptyElement = screen.getByRole('status');
    expect(emptyElement).toHaveClass('panel', 'empty-state');
    expect(screen.getByText('No events found')).toHaveClass('empty-message');
  });

  it('renders empty illustration', () => {
    render(<Empty />);
    const svg = document.querySelector('.empty-illustration');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it('has correct accessibility attributes', () => {
    render(<Empty message="Custom message" />);
    const emptyElement = screen.getByRole('status');
    expect(emptyElement).toHaveAttribute('aria-live', 'polite');
  });
});

