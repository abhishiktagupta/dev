import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import Empty from '../components/Empty';
import { useAppState } from '../store/timeRangeContext';
import { useFetch } from '../hooks/useFetch';
import Modal from '../components/Modal';
import ColumnSelector from '../components/ColumnSelector';
import type { EventItem } from '../components/DataTable';

// Lazy load heavy components - only load when TablePage is accessed
const DataTable = lazy(() => import('../components/DataTable'));

export default function TablePage() {
  const { state } = useAppState();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [sort, setSort] = useState('timestamp:desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => { setPage(1); }, [state.timeRange, sort, JSON.stringify(filters)]);

  const qsFilters = useMemo(() =>
    Object.entries(filters)
      .filter(([, v]) => v && v.trim().length)
      .map(([k, v]) => `${k}:${v}`)
      .join(','),
    [filters]
  );

  const url = useMemo(() => {
    const params = new URLSearchParams({
      start: state.timeRange.start,
      end: state.timeRange.end,
      page: String(page),
      pageSize: String(pageSize),
      sort
    });
    if (qsFilters) params.set('filters', qsFilters);
    return `http://localhost:4002/events?${params.toString()}`;
  }, [state.timeRange, page, pageSize, sort, qsFilters]);

  const { data, loading, error } = useFetch<{ items: EventItem[]; page: number; pageSize: number; total: number; totalPages: number }>(url, [url]);

  // Stable callback for filters change
  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="row">
      {error && <Empty message={error.message} />}
      {loading && !data && <Loading />}
      {!loading && !error && data && data.items.length === 0 && (
        <Empty message="No matching events." />
      )}
      {data && (
        <Suspense fallback={<Loading label="Loading table..." />}>
          <DataTable
            items={data.items || []}
            page={data.page || 1}
            pageSize={data.pageSize || pageSize}
            total={data.total || 0}
            totalPages={data.totalPages || 1}
            sort={sort}
            onSortChange={setSort}
            onPageChange={setPage}
            onFiltersChange={handleFiltersChange}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Suspense>
      )}
      {loading && data && <Loading label="Updating..." />}
      
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Column Settings"
      >
        <ColumnSelector />
      </Modal>
    </div>
  );
}
