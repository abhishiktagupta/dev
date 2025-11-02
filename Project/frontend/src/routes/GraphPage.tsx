import { Suspense, lazy } from 'react';
import TimeRangePicker from '../components/TimeRangePicker';
import Loading from '../components/Loading';
import Empty from '../components/Empty';
import { useAppState } from '../store/timeRangeContext';
import { useFetch } from '../hooks/useFetch';

// Lazy load chart component - only load when GraphPage is accessed and data is available
const TimeSeriesChart = lazy(() => import('../components/TimeSeriesChart'));

export default function GraphPage() {
  const { state } = useAppState();
  const url = `http://localhost:4001/events/count?start=${encodeURIComponent(state.timeRange.start)}&end=${encodeURIComponent(state.timeRange.end)}`;
  const { data, loading, error } = useFetch<{ buckets: { timestamp: string; count: number }[]; total: number }>(url, [state.timeRange]);

  return (
    <div className="graph-page" aria-busy={loading} aria-live="polite">
      <TimeRangePicker />
      {loading && (
        <div aria-live="polite" aria-busy="true">
          <Loading />
        </div>
      )}
      {error && (
        <div role="alert" aria-live="assertive">
          <Empty message={error.message} />
        </div>
      )}
      {!loading && !error && (
        data?.buckets?.length ? (
          <Suspense fallback={
            <div aria-live="polite" aria-busy="true">
              <Loading label="Loading chart..." />
            </div>
          }>
            <TimeSeriesChart buckets={data!.buckets} timeRange={state.timeRange} />
          </Suspense>
        ) : (
          <Empty message="No events in the selected time range." />
        )
      )}
    </div>
  );
}
