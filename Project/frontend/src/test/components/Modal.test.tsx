import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../components/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Test Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<Modal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog', { name: /test modal/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Test Modal')).toBeInTheDocument();
    expect(within(dialog).getByText('Test Content')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<Modal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog', { name: /test modal/i });
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    
    const title = screen.getByRole('heading', { name: /test modal/i });
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Modal {...defaultProps} />);
    
    const overlay = container.querySelector('.modal-overlay');
    expect(overlay).toBeInTheDocument();
    
    if (overlay) {
      await user.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog', { name: /test modal/i });
    const modalContent = within(dialog).getByText('Test Content');
    
    await user.click(modalContent);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog', { name: /test modal/i });
    expect(dialog).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('sets body overflow to hidden when modal is open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});

