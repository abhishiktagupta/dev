import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { TimeRangeProvider, useAppState } from '../../store/timeRangeContext';

describe('TimeRangeContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TimeRangeProvider>{children}</TimeRangeProvider>
  );

  it('provides default state values', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.state.timeRange.start).toBe('2021-07-26T00:00:00.000Z');
    expect(result.current.state.timeRange.end).toBe('2021-08-25T23:59:59.999Z');
    expect(result.current.state.visibleColumns).toEqual([
      'timestamp',
      'attacker.id',
      'attacker.ip',
      'attacker.name',
      'type',
      'decoy.name'
    ]);
  });

  it('updates time range when setTimeRange is called', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const newTimeRange = {
      start: '2021-08-01T00:00:00.000Z',
      end: '2021-08-31T23:59:59.999Z'
    };

    act(() => {
      result.current.setTimeRange(newTimeRange);
    });

    expect(result.current.state.timeRange).toEqual(newTimeRange);
  });

  it('updates visible columns when setVisibleColumns is called', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const newColumns = ['timestamp', 'type'];

    act(() => {
      result.current.setVisibleColumns(newColumns);
    });

    expect(result.current.state.visibleColumns).toEqual(newColumns);
  });

  it('allows setting empty visible columns array', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.setVisibleColumns([]);
    });

    expect(result.current.state.visibleColumns).toEqual([]);
  });

  it('allows setting all columns', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const allColumns = [
      'timestamp',
      'attacker.id',
      'attacker.ip',
      'attacker.name',
      'type',
      'decoy.name',
      'severity'
    ];

    act(() => {
      result.current.setVisibleColumns(allColumns);
    });

    expect(result.current.state.visibleColumns).toEqual(allColumns);
  });

  it('maintains separate state instances for different providers', () => {
    const TestComponent1 = () => {
      const { state, setTimeRange } = useAppState();
      return (
        <div>
          <span data-testid="start1">{state.timeRange.start}</span>
          <button onClick={() => setTimeRange({ start: '2021-09-01T00:00:00.000Z', end: state.timeRange.end })}>
            Update
          </button>
        </div>
      );
    };

    render(
      <TimeRangeProvider>
        <TestComponent1 />
      </TimeRangeProvider>
    );

    const startSpan = screen.getByTestId('start1');
    expect(startSpan).toHaveTextContent('2021-07-26T00:00:00.000Z');
    
    const updateButton = screen.getByRole('button', { name: /update/i });
    expect(updateButton).toBeInTheDocument();
  });

  it('preserves non-updated state when updating time range', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const initialColumns = result.current.state.visibleColumns;

    act(() => {
      result.current.setTimeRange({
        start: '2021-08-01T00:00:00.000Z',
        end: '2021-08-31T23:59:59.999Z'
      });
    });

    expect(result.current.state.visibleColumns).toEqual(initialColumns);
  });

  it('preserves non-updated state when updating visible columns', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const initialTimeRange = result.current.state.timeRange;

    act(() => {
      result.current.setVisibleColumns(['timestamp']);
    });

    expect(result.current.state.timeRange).toEqual(initialTimeRange);
  });

  it('provides stable function references', () => {
    const { result, rerender } = renderHook(() => useAppState(), { wrapper });

    const firstSetTimeRange = result.current.setTimeRange;
    const firstSetVisibleColumns = result.current.setVisibleColumns;

    rerender();

    // Functions should be stable (memoized)
    expect(result.current.setTimeRange).toBe(firstSetTimeRange);
    expect(result.current.setVisibleColumns).toBe(firstSetVisibleColumns);
  });
});

