import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import Empty from '../components/Empty';
import TimeRangePicker from '../components/TimeRangePicker';
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
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState('timestamp:desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Memoize filters key to avoid expensive JSON.stringify on every render
  const filtersKey = useMemo(
    () => Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(','),
    [filters]
  );

  useEffect(() => { setPage(1); }, [state.timeRange, sort, filtersKey, pageSize]);

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

  // Stable callbacks to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  }, []);

  return (
    <div aria-busy={loading} aria-live="polite">
      <TimeRangePicker />
      
      {loading && !data && (
        <div aria-live="polite" aria-busy="true">
          <Loading />
        </div>
      )}
      
      {error && (
        <div className="row" role="alert" aria-live="assertive">
          <Empty message={error.message} />
        </div>
      )}
      
      {/* Always show DataTable when data is available, even if empty */}
      {!error && data && (
        <div className="row" aria-live="polite" aria-atomic="true">
          <Suspense fallback={
            <div aria-live="polite" aria-busy="true">
              <Loading label="Loading table..." />
            </div>
          }>
            <DataTable
              items={data.items || []}
              page={data.page || 1}
              pageSize={data.pageSize || pageSize}
              total={data.total || 0}
              totalPages={data.totalPages || 1}
              sort={sort}
              onSortChange={handleSortChange}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onFiltersChange={handleFiltersChange}
              onOpenSettings={handleOpenSettings}
            />
          </Suspense>
        </div>
      )}
      
      {loading && data && (
        <div aria-live="polite" aria-busy="true">
          <Loading label="Updating..." />
        </div>
      )}
      
      <Modal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        title="Column Settings"
      >
        <ColumnSelector />
      </Modal>
    </div>
  );
}
