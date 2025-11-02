import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../../components/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders current page information', () => {
    render(<Pagination {...defaultProps} />);
    
    const nav = screen.getByRole('navigation', { name: /pagination/i });
    const pageInfo = within(nav).getByText((content, element) => {
      return element?.textContent === 'Page 1 of 5';
    });
    expect(pageInfo).toBeInTheDocument();
  });

  it('disables first and previous buttons on first page', () => {
    render(<Pagination {...defaultProps} page={1} />);
    
    const firstButton = screen.getByLabelText('First page');
    const previousButton = screen.getByLabelText('Previous page');
    
    expect(firstButton).toBeDisabled();
    expect(previousButton).toBeDisabled();
    expect(firstButton).toHaveAttribute('aria-disabled', 'true');
    expect(previousButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables next and last buttons on last page', () => {
    render(<Pagination {...defaultProps} page={5} />);
    
    const nextButton = screen.getByLabelText('Next page');
    const lastButton = screen.getByLabelText('Last page');
    
    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
    expect(nextButton).toHaveAttribute('aria-disabled', 'true');
    expect(lastButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables all buttons on middle pages', () => {
    render(<Pagination {...defaultProps} page={3} />);
    
    expect(screen.getByLabelText('First page')).not.toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Last page')).not.toBeDisabled();
  });

  it('calls onPageChange with correct page when first button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    
    await user.click(screen.getByLabelText('First page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with previous page when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    
    await user.click(screen.getByLabelText('Previous page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    
    await user.click(screen.getByLabelText('Next page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with last page when last button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    
    await user.click(screen.getByLabelText('Last page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
  });

  it('has correct accessibility attributes', () => {
    render(<Pagination {...defaultProps} page={3} />);
    
    const nav = screen.getByRole('navigation', { name: /pagination/i });
    expect(nav).toBeInTheDocument();
    
    const currentPage = within(nav).getByText((content, element) => {
      return element?.textContent === 'Page 3 of 5';
    });
    expect(currentPage).toHaveAttribute('aria-live', 'polite');
    expect(currentPage).toHaveAttribute('aria-atomic', 'true');
  });

  it('marks current page with aria-current', () => {
    render(<Pagination {...defaultProps} page={3} />);
    
    const nav = screen.getByRole('navigation', { name: /pagination/i });
    const pageIndicator = within(nav).getByText('3');
    expect(pageIndicator).toHaveAttribute('aria-current', 'page');
  });
});

