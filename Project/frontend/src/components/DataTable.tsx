import { useEffect, useMemo, useState } from 'react';
import Pagination from './Pagination';
import { useAppState } from '../store/timeRangeContext';
import { useDebounce } from '../hooks/useDebounce';

export type EventItem = {
  id: string;
  timestamp: string;
  type: string;
  attacker: { id: string; ip: string; name: string };
  decoy: { name: string };
  severity?: string;
};

type Props = {
  items: EventItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sort: string;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onFiltersChange: (filters: Record<string, string>) => void;
};

const COLUMN_LABELS: Record<string, string> = {
  'timestamp': 'Timestamp',
  'attacker.id': 'Attacker ID',
  'attacker.ip': 'Attacker IP',
  'attacker.name': 'Attacker Name',
  'type': 'Type',
  'decoy.name': 'Decoy',
  'severity': 'Severity'
};

type DataTableProps = Props & {
  onOpenSettings?: () => void;
};

export default function DataTable({ items, page, pageSize, total, totalPages, sort, onSortChange, onPageChange, onPageSizeChange, onFiltersChange, onOpenSettings }: DataTableProps) {
  const { state } = useAppState();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const debounced = useDebounce(filters, 400);
  const [sortAnnouncement, setSortAnnouncement] = useState<string>('');
  const [filterAnnouncement, setFilterAnnouncement] = useState<string>('');

  const visibleColumns = state.visibleColumns;

  const headers = useMemo(() => visibleColumns.map(col => ({ key: col, label: COLUMN_LABELS[col] || col })), [visibleColumns]);

  const [sortField, sortDir] = useMemo(() => {
    const [f = 'timestamp', d = 'desc'] = sort.split(':');
    return [f, d] as const;
  }, [sort]);

  const applyFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const label = COLUMN_LABELS[key] || key;
    if (value.trim()) {
      setFilterAnnouncement(`Filtering ${label} by ${value}`);
    } else {
      setFilterAnnouncement(`Cleared ${label} filter`);
    }
  };

  useEffect(() => {
    onFiltersChange(debounced);
    if (Object.keys(debounced).length > 0) {
      const activeFilters = Object.entries(debounced)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `${COLUMN_LABELS[k] || k}: ${v}`)
        .join(', ');
      setFilterAnnouncement(activeFilters ? `Active filters: ${activeFilters}` : '');
    } else {
      setFilterAnnouncement('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleSortChange = (newSort: string) => {
    const [field, direction] = newSort.split(':');
    const label = COLUMN_LABELS[field] || field;
    setSortAnnouncement(`Sorted by ${label}, ${direction === 'asc' ? 'ascending' : 'descending'}`);
    onSortChange(newSort);
  };

  const hasItems = items && items.length > 0;

  return (
    <div className="panel">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {sortAnnouncement && <span>{sortAnnouncement}</span>}
        {filterAnnouncement && <span>{filterAnnouncement}</span>}
        {hasItems && <span>Showing {items.length} of {total} events, page {page} of {totalPages}</span>}
      </div>
      {onOpenSettings && (
        <div className="settings-button-container">
          <button 
            className="btn-settings" 
            onClick={onOpenSettings}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenSettings();
              }
            }}
            aria-label="Open column settings"
            aria-haspopup="dialog"
            tabIndex={0}
          >
            <span aria-hidden="true">⚙️</span> Columns
          </button>
        </div>
      )}
      <div className="table-wrapper">
        <table 
          className="table" 
          role="table" 
          aria-label="Events table" 
          aria-rowcount={(hasItems ? items.length : 0) + 1} 
          aria-colcount={headers.length}
          aria-describedby="table-summary"
        >
          <caption id="table-summary" className="sr-only">
            Events table with {headers.length} columns and {hasItems ? items.length : 0} rows. Use sort buttons in column headers to sort data. Use filter inputs to filter by column values.
          </caption>
          <thead>
            <tr role="row" aria-rowindex={1}>
              {headers.map((h, colIdx) => (
                <th key={h.key} role="columnheader" aria-sort={sortField === h.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} scope="col" aria-colindex={colIdx + 1}>
                  <button 
                    onClick={() => handleSortChange(`${h.key}:${sortField === h.key && sortDir === 'asc' ? 'desc' : 'asc'}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSortChange(`${h.key}:${sortField === h.key && sortDir === 'asc' ? 'desc' : 'asc'}`);
                      }
                    }}
                    aria-label={`Sort by ${h.label}, ${sortField === h.key ? (sortDir === 'asc' ? 'currently ascending' : 'currently descending') : 'not sorted'}`}
                    aria-pressed={sortField === h.key}
                    tabIndex={0}
                  >
                    {h.label} {sortField === h.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                  <input
                    className="filter-input"
                    type="text"
                    placeholder="Filter"
                    value={filters[h.key] || ''}
                    onChange={(e) => applyFilterChange(h.key, e.target.value)}
                    aria-label={`Filter ${h.label}`}
                    aria-describedby={`filter-${h.key}-desc`}
                    tabIndex={0}
                  />
                  <span id={`filter-${h.key}-desc`} className="sr-only">Filter results by {h.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              items.map((row, idx) => (
                <tr key={row.id} role="row" aria-rowindex={idx + 2} aria-label={`Row ${idx + 1}: ${row.type || 'Event'} from ${new Date(row.timestamp).toLocaleString()}`}>
                  {headers.map((h, colIdx) => (
                    <td key={h.key} role="gridcell" aria-colindex={colIdx + 1} aria-label={`${h.label}: ${renderCell(row, h.key)?.toString() || ''}`}>{renderCell(row, h.key)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr role="row">
                <td colSpan={headers.length} className="table-empty-cell" role="status">
                  <div className="table-empty-state">
                    <p className="table-empty-message" aria-live="polite">No matching events.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-footer-left">
          <div className="table-footer-info">Total: {total}</div>
          {onPageSizeChange && (
            <div className="page-size-selector">
              <label htmlFor="page-size-select" className="page-size-label">
                Records per page:
              </label>
              <select
                id="page-size-select"
                className="page-size-select"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Select number of records per page"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

function renderCell(row: EventItem, key: string) {
  if (key === 'timestamp') return new Date(row.timestamp).toLocaleString();
  if (key === 'type') return <span className="type-badge">{row.type}</span>;
  if (key === 'decoy.name') return row.decoy?.name ?? '';
  if (key === 'severity') {
    const severity = row.severity ?? '';
    return <span className={`severity-badge severity-${severity.toLowerCase()}`}>{severity}</span>;
  }
  if (key === 'attacker.id') return <code>{row.attacker?.id ?? ''}</code>;
  if (key === 'attacker.ip') return <code>{row.attacker?.ip ?? ''}</code>;
  if (key === 'attacker.name') return row.attacker?.name ?? '';
  return '';
}
