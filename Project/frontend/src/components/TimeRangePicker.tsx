import { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../store/timeRangeContext';

const validateTimeRange = (start: string, end: string): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(toUTC(start));
  const endDate = new Date(toUTC(end));
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  return endDate.getTime() <= startDate.getTime() ? 'End time must be greater than start time' : null;
};

export default function TimeRangePicker() {
  const { state, setTimeRange } = useAppState();
  const startLocal = useMemo(() => toLocalInput(state.timeRange.start), [state.timeRange.start]);
  const endLocal = useMemo(() => toLocalInput(state.timeRange.end), [state.timeRange.end]);
  const [startInputValue, setStartInputValue] = useState(startLocal);
  const [endInputValue, setEndInputValue] = useState(endLocal);
  const [focusedValue, setFocusedValue] = useState<{ start?: string; end?: string }>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setStartInputValue(startLocal);
    setEndInputValue(endLocal);
    setError(null);
  }, [startLocal, endLocal]);
  
  useEffect(() => {
    setError(validateTimeRange(startInputValue, endInputValue));
  }, [startInputValue, endInputValue]);

  const createHandlers = (type: 'start' | 'end') => {
    const originalValue = type === 'start' ? startLocal : endLocal;
    const setValue = type === 'start' ? setStartInputValue : setEndInputValue;
    
    return {
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => 
        setFocusedValue(prev => ({ ...prev, [type]: e.target.value })),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const original = focusedValue[type] ?? originalValue;
        setFocusedValue(prev => ({ ...prev, [type]: undefined }));
        
        if (newValue && newValue !== original) {
          const validation = type === 'start' 
            ? validateTimeRange(newValue, endInputValue)
            : validateTimeRange(startInputValue, newValue);
          
          if (validation) {
            setValue(originalValue);
          } else {
            setTimeRange(type === 'start' 
              ? { start: toUTC(newValue), end: state.timeRange.end }
              : { start: state.timeRange.start, end: toUTC(newValue) }
            );
          }
        } else {
          setValue(originalValue);
        }
      }
    };
  };

  const startHandlers = createHandlers('start');
  const endHandlers = createHandlers('end');

  return (
    <div className="time-range-picker-container">
      {error && (
        <div className="error-banner" role="alert" aria-live="polite">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      <div className="panel time-range-picker" role="group" aria-label="Time Range">
        {(['start', 'end'] as const).map((type) => (
          <div key={type} className="time-range-field">
            <label htmlFor={type}>{type === 'start' ? 'Start' : 'End'} Time</label>
            <input
              id={type}
              type="datetime-local"
              value={type === 'start' ? startInputValue : endInputValue}
              {...(type === 'start' ? startHandlers : endHandlers)}
              aria-label={`Select ${type} date and time`}
              aria-required="true"
              aria-invalid={error !== null}
              tabIndex={0}
            />
          </div>
        ))}
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
