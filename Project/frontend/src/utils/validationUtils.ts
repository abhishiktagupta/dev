/**
 * Input validation and sanitization utilities
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param value - The input value to sanitize
 * @param strict - If true, validates datetime-local format; if false, just sanitizes HTML/scripts
 * @returns Sanitized string, empty if strict validation fails
 */
export function sanitizeInput(value: string, strict: boolean = false): string {
  if (!value) return '';
  
  // Sanitize the input to remove any HTML/script tags and malicious content
  const sanitized = DOMPurify.sanitize(value, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
  
  // Only validate strict format when finalizing (on blur), not during typing
  if (strict) {
    const datetimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return datetimeLocalPattern.test(sanitized) ? sanitized : '';
  }
  
  // During typing, just return sanitized value (browser will enforce format)
  return sanitized;
}

/**
 * Validates that end time is greater than start time
 * @param start - Start datetime string
 * @param end - End datetime string
 * @returns Error message if invalid, null if valid
 */
export function validateTimeRange(start: string, end: string, toUTC: (local: string) => string): string | null {
  if (!start || !end) return null;
  const startDate = new Date(toUTC(start));
  const endDate = new Date(toUTC(end));
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  return endDate.getTime() <= startDate.getTime() ? 'End time must be greater than start time' : null;
}

/**
 * Sanitizes text for safe display (prevents XSS)
 */
export function sanitizeForDisplay(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

