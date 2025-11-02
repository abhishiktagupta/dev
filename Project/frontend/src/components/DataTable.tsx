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

export default function DataTable({ items, page, pageSize, total, totalPages, sort, onSortChange, onPageChange, onFiltersChange, onOpenSettings }: DataTableProps) {
  const { state } = useAppState();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const debounced = useDebounce(filters, 400);

  const visibleColumns = state.visibleColumns;

  const headers = useMemo(() => visibleColumns.map(col => ({ key: col, label: COLUMN_LABELS[col] || col })), [visibleColumns]);

  const [sortField, sortDir] = useMemo(() => {
    const [f = 'timestamp', d = 'desc'] = sort.split(':');
    return [f, d] as const;
  }, [sort]);

  const applyFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    onFiltersChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Don't render table structure if there are no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="panel">
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
        <table className="table" role="table" aria-label="Events table" aria-rowcount={items.length + 1} aria-colcount={headers.length}>
          <thead>
            <tr role="row" aria-rowindex={1}>
              {headers.map((h, colIdx) => (
                <th key={h.key} role="columnheader" aria-sort={sortField === h.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} scope="col" aria-colindex={colIdx + 1}>
                  <button 
                    onClick={() => onSortChange(`${h.key}:${sortField === h.key && sortDir === 'asc' ? 'desc' : 'asc'}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSortChange(`${h.key}:${sortField === h.key && sortDir === 'asc' ? 'desc' : 'asc'}`);
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
            {items.map((row, idx) => (
              <tr key={row.id} role="row" aria-rowindex={idx + 2}>
                {headers.map((h, colIdx) => (
                  <td key={h.key} role="gridcell" aria-colindex={colIdx + 1}>{renderCell(row, h.key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-footer-info">Total: {total} • Page size: {pageSize}</div>
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
