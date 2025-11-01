import { useMemo } from 'react';
import { useAppState } from '../store/timeRangeContext';

export default function TimeRangePicker() {
  const { state, setTimeRange } = useAppState();
  const startLocal = useMemo(() => toLocalInput(state.timeRange.start), [state.timeRange.start]);
  const endLocal = useMemo(() => toLocalInput(state.timeRange.end), [state.timeRange.end]);

  return (
    <div className="panel time-range-picker" role="group" aria-label="Time Range">
      <div className="time-range-field">
        <label htmlFor="start">Start Time</label>
        <input
          id="start"
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setTimeRange({ start: toUTC(e.target.value), end: state.timeRange.end })}
          aria-label="Select start date and time"
          aria-required="true"
          tabIndex={0}
        />
      </div>
      <div className="time-range-field">
        <label htmlFor="end">End Time</label>
        <input
          id="end"
          type="datetime-local"
          value={endLocal}
          onChange={(e) => setTimeRange({ start: state.timeRange.start, end: toUTC(e.target.value) })}
          aria-label="Select end date and time"
          aria-required="true"
          tabIndex={0}
        />
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function toUTC(local: string) {
  const d = new Date(local);
  return d.toISOString();
}
