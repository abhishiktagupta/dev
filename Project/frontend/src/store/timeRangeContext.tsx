import { createContext, useContext, useMemo, useReducer, useCallback, type ReactNode } from 'react';

export type TimeRange = { start: string; end: string };
export type AppState = {
  timeRange: TimeRange;
  visibleColumns: string[];
};

export type Action =
  | { type: 'setTimeRange'; payload: TimeRange }
  | { type: 'setVisibleColumns'; payload: string[] };

const defaultColumns = ['timestamp', 'attacker.id', 'attacker.ip', 'attacker.name', 'type', 'decoy.name'];

const initialState: AppState = {
  timeRange: {
    start: '2021-07-26T00:00:00.000Z',
    end: '2021-08-25T23:59:59.999Z'
  },
  visibleColumns: defaultColumns
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setTimeRange':
      return { ...state, timeRange: action.payload };
    case 'setVisibleColumns':
      return { ...state, visibleColumns: action.payload };
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: AppState;
  setTimeRange: (range: TimeRange) => void;
  setVisibleColumns: (cols: string[]) => void;
}>({} as any);

export function TimeRangeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Stable function references to prevent unnecessary re-renders
  const setTimeRange = useCallback(
    (range: TimeRange) => dispatch({ type: 'setTimeRange', payload: range }),
    []
  );

  const setVisibleColumns = useCallback(
    (cols: string[]) => dispatch({ type: 'setVisibleColumns', payload: cols }),
    []
  );

  const value = useMemo(
    () => ({
      state,
      setTimeRange,
      setVisibleColumns,
    }),
    [state, setTimeRange, setVisibleColumns]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  return useContext(Ctx);
}
