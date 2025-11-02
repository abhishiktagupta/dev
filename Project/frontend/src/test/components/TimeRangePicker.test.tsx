import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../utils';
import TimeRangePicker from '../../components/TimeRangePicker';

describe('TimeRangePicker', () => {
  it('renders start and end time inputs', () => {
    customRender(<TimeRangePicker />);
    
    expect(screen.getByLabelText(/start date and time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date and time/i)).toBeInTheDocument();
  });

  it('displays default time range values', () => {
    customRender(<TimeRangePicker />);
    
    const startInput = screen.getByLabelText(/start date and time/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/end date and time/i) as HTMLInputElement;
    
    expect(startInput.value).toBeTruthy();
    expect(endInput.value).toBeTruthy();
  });

  it('updates start time when start input changes', async () => {
    const { fireEvent } = await import('@testing-library/react');
    customRender(<TimeRangePicker />);
    
    const startInput = screen.getByLabelText(/start date and time/i) as HTMLInputElement;
    const initialValue = startInput.value;
    
    // Use fireEvent to directly set a valid date value (datetime-local format)
    const newDate = '2021-07-27T10:00';
    fireEvent.change(startInput, { target: { value: newDate } });
    
    // Value should be updated
    expect(startInput.value).toBe(newDate);
    expect(startInput.value).not.toBe(initialValue);
  });

  it('updates end time when end input changes', async () => {
    const { fireEvent } = await import('@testing-library/react');
    customRender(<TimeRangePicker />);
    
    const endInput = screen.getByLabelText(/end date and time/i) as HTMLInputElement;
    const initialValue = endInput.value;
    
    // Use fireEvent to directly set a valid date value (datetime-local format)
    const newDate = '2021-08-26T10:00';
    fireEvent.change(endInput, { target: { value: newDate } });
    
    // Value should be updated
    expect(endInput.value).toBe(newDate);
    expect(endInput.value).not.toBe(initialValue);
  });

  it('has correct accessibility attributes', () => {
    customRender(<TimeRangePicker />);
    
    const group = screen.getByRole('group', { name: /time range/i });
    expect(group).toBeInTheDocument();
    
    const startInput = screen.getByLabelText(/start date and time/i);
    expect(startInput).toHaveAttribute('aria-required', 'true');
    expect(startInput).toHaveAttribute('type', 'datetime-local');
    
    const endInput = screen.getByLabelText(/end date and time/i);
    expect(endInput).toHaveAttribute('aria-required', 'true');
    expect(endInput).toHaveAttribute('type', 'datetime-local');
  });

  it('has proper labels for inputs', () => {
    customRender(<TimeRangePicker />);
    
    expect(screen.getByText(/start time/i)).toBeInTheDocument();
    expect(screen.getByText(/end time/i)).toBeInTheDocument();
    
    // Check inputs by their IDs which are associated with labels
    expect(screen.getByLabelText(/start date and time/i)).toHaveAttribute('id', 'start');
    expect(screen.getByLabelText(/end date and time/i)).toHaveAttribute('id', 'end');
  });
});

