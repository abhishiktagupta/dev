import { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../store/timeRangeContext';
import { toLocalInput, toUTC } from '../utils/dateUtils';
import { sanitizeInput, validateTimeRange, sanitizeForDisplay } from '../utils/validationUtils';

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
    setError(validateTimeRange(startInputValue, endInputValue, toUTC));
  }, [startInputValue, endInputValue]);

  const createHandlers = (type: 'start' | 'end') => {
    const originalValue = type === 'start' ? startLocal : endLocal;
    const setValue = type === 'start' ? setStartInputValue : setEndInputValue;
    
    return {
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
        const sanitized = sanitizeInput(e.target.value, false);
        setFocusedValue(prev => ({ ...prev, [type]: sanitized }));
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sanitize during typing to prevent XSS but allow partial input
        const sanitized = sanitizeInput(e.target.value, false);
        setValue(sanitized);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        // Strict validation on blur to ensure proper format
        const sanitized = sanitizeInput(e.target.value, true);
        const newValue = sanitized;
        const original = focusedValue[type] ?? originalValue;
        setFocusedValue(prev => ({ ...prev, [type]: undefined }));
        
        if (newValue && newValue !== original) {
          const validation = type === 'start' 
            ? validateTimeRange(newValue, endInputValue, toUTC)
            : validateTimeRange(startInputValue, newValue, toUTC);
          
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
          <span>{sanitizeForDisplay(error)}</span>
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
