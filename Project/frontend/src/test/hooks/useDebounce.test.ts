import { renderHook, waitFor, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('returns debounced value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('first'); // Still first value

    act(() => {
      jest.advanceTimersByTime(100); // Total 300ms since last change
    });
    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('uses custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      jest.advanceTimersByTime(200); // Total 500ms
    });
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('works with default delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(300); // Default delay
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('works with number values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 100 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe(100);
    });
  });

  it('works with object values', async () => {
    const initialObj = { key: 'value1' };
    const updatedObj = { key: 'value2' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } }
    );

    rerender({ value: updatedObj });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toEqual(updatedObj);
    });
  });

  it('clears timeout on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('value', 300));

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

