import { useMemo } from 'react';
import { useAppState } from '../store/timeRangeContext';

export const ALL_COLUMNS = [
  'timestamp',
  'attacker.id',
  'attacker.ip',
  'attacker.name',
  'type',
  'decoy.name',
  'severity'
];

const COLUMN_LABELS: Record<string, string> = {
  'timestamp': 'Timestamp',
  'attacker.id': 'Attacker ID',
  'attacker.ip': 'Attacker IP',
  'attacker.name': 'Attacker Name',
  'type': 'Type',
  'decoy.name': 'Decoy',
  'severity': 'Severity'
};

export default function ColumnSelector() {
  const { state, setVisibleColumns } = useAppState();
  const selected = state.visibleColumns;
  const allSelected = useMemo(() => ALL_COLUMNS.every(c => selected.includes(c)), [selected]);

  const toggle = (col: string) => {
    if (selected.includes(col)) setVisibleColumns(selected.filter(c => c !== col));
    else setVisibleColumns([...selected, col]);
  };

  return (
    <div className="column-selector" role="group" aria-label="Column visibility">
      <div className="column-selector-header">
        <div className="column-selector-title">Select columns to display</div>
        <div className="column-selector-actions">
          <button 
            className="btn-action btn-secondary" 
            onClick={() => setVisibleColumns(ALL_COLUMNS)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVisibleColumns(ALL_COLUMNS);
              }
            }}
            aria-label="Select all columns"
            tabIndex={0}
          >
            Select all
          </button>
          <button 
            className="btn-action btn-secondary" 
            onClick={() => setVisibleColumns([])}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVisibleColumns([]);
              }
            }}
            aria-label="Select no columns"
            tabIndex={0}
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="column-selector-grid">
        {ALL_COLUMNS.map(col => (
          <label key={col} className="column-selector-item">
            <input
              type="checkbox"
              checked={selected.includes(col)}
              onChange={() => toggle(col)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(col);
                }
              }}
              aria-checked={selected.includes(col)}
              aria-label={`Toggle ${COLUMN_LABELS[col] || col}`}
              tabIndex={0}
            />
            <span>{COLUMN_LABELS[col] || col}</span>
          </label>
        ))}
      </div>
      <div className="column-selector-footer">
        {allSelected ? 'All columns visible' : `${selected.length} of ${ALL_COLUMNS.length} columns selected`}
      </div>
    </div>
  );
}

