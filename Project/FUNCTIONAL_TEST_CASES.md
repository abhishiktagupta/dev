# Event Tracker - Functional Test Cases

Project: Event Tracker Application  
Version: 1.0.0  
Date: 2025
Total Test Cases: 25  
Document Version: 1.0

---

## Test Execution Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Passed | 25 | 100% |
| Failed | 0 | 0% |
| Blocked | 0 | 0% |
| Skipped | 0 | 0% |

Overall Status: ALL TESTS PASSING

---

## Test Case Details

1. TC-001: Time Range Selection - Start Date
Priority: High  
Module: TimeRangePicker  
Status: PASSED

Description:  
Verify that users can select a start date and time, and it updates the time range context.

Preconditions:
- Application is running
- User is on Graph or Table page

Test Steps:
1. Open the application
2. Click on the "Start Time" input field
3. Select a date using the date picker (e.g., August 1, 2021, 10:00 AM)
4. Verify the selected date appears in the input field
5. Check that the graph/table updates with data for the selected range

Expected Result:
- Start date is displayed in the input field in datetime-local format
- Graph/Table updates to show data within the new time range
- No error messages displayed

Actual Result: Pass - Start date selection works correctly, updates context, and triggers data refresh

Notes: Validated with time range validation logic

---

2. TC-002: Time Range Selection - End Date
Priority: High  
Module: TimeRangePicker  
Status:  PASSED

Description:  
Verify that users can select an end date and time, and it updates the time range context.

Test Steps:
1. Open the application
2. Click on the "End Time" input field
3. Select a date using the date picker (e.g., August 25, 2021, 11:59 PM)
4. Verify the selected date appears in the input field
5. Check that the graph/table updates with data for the selected range

Expected Result:
- End date is displayed in the input field
- Graph/Table updates to show data within the new time range
- No error messages displayed

Actual Result: Pass - End date selection works correctly

---

3. TC-003: Time Range Validation - End Before Start
Priority: High  
Module: TimeRangePicker  
Status: PASSED

Description:  
Verify that the system validates and prevents end time from being earlier than start time.

Test Steps:
1. Set Start Time to: August 25, 2021, 14:00
2. Attempt to set End Time to: August 25, 2021, 10:00 (before start)
3. Click outside the input field (onBlur)
4. Observe error message

Expected Result:
- Error banner appears above the date inputs
- Error message: "End time must be greater than start time"
- End time input reverts to previous valid value
- Graph/Table does not update with invalid range

Actual Result: Pass - Validation error displayed, input reverts to previous value

Screenshot Reference: Error banner displayed with appropriate styling

---

4. TC-004: Graph Page - Display Time Series Chart
Priority: High  
Module: GraphPage, TimeSeriesChart  
Status: PASSED

Description:  
Verify that the graph page displays a time series chart when data is available.

Preconditions:
- Time range has been selected
- Data exists for the selected time range

Test Steps:
1. Navigate to Graph page (click "Graph" button)
2. Select a time range with available data
3. Wait for chart to load
4. Verify chart is displayed

Expected Result:
- Chart is rendered on the page
- Chart displays data points as a line graph
- X-axis shows time/dates
- Y-axis shows event counts
- Y-axis label displays "No of events"
- Legend shows selected time range at the bottom

Actual Result: Pass - Chart renders correctly with all elements visible

---

5. TC-005: Graph Page - Time Range > 24 Hours Display
Priority: Medium  
Module: TimeSeriesChart  
Status: PASSED

Description:  
Verify that for time ranges greater than 24 hours, the X-axis displays dates (not times).

Test Steps:
1. Navigate to Graph page
2. Select time range: July 26, 2021 00:00 - August 25, 2021 23:59 (30 days)
3. Observe X-axis labels
4. Verify date format

Expected Result:
- X-axis shows date labels (e.g., "Aug 1", "Aug 2")
- Dates are displayed below day numbers
- Labels are evenly spaced and non-overlapping
- Time range legend shows full date and time

Actual Result: Pass - X-axis correctly displays dates for ranges > 24 hours

---

6. TC-006: Graph Page - Time Range ≤ 24 Hours Display
Priority: Medium  
Module: TimeSeriesChart  
Status: PASSED

Description:  
Verify that for time ranges ≤ 24 hours, the X-axis displays time in HH:MM:SS format.

Test Steps:
1. Navigate to Graph page
2. Select time range: August 4, 2021 06:30 - August 4, 2021 14:59 (8.5 hours)
3. Observe X-axis labels
4. Verify time format

Expected Result:
- X-axis shows time labels in HH:MM:SS format (e.g., "06:30:00", "07:00:00")
- Labels are rotated 45 degrees to prevent overlap
- Every second is considered, labels filtered for spacing
- Graph shows granular data points

Actual Result: Pass - X-axis correctly displays time format for ranges ≤ 24 hours

---

7. TC-007: Graph Page - Chart Hover Interaction
Priority: Medium  
Module: TimeSeriesChart  
Status: PASSED

Description:  
Verify that hovering over the chart line displays a tooltip with event details.

Test Steps:
1. Navigate to Graph page
2. Select a time range with data
3. Wait for chart to render
4. Move mouse cursor over the chart line
5. Observe tooltip appearance

Expected Result:
- Tooltip appears near the mouse cursor
- Tooltip shows timestamp (date and time)
- Tooltip shows event count for that data point
- Tooltip has a highlighted circle on the line
- Tooltip disappears when mouse moves away

Actual Result: Pass - Tooltip displays correctly with all required information

---

8. TC-008: Graph Page - Keyboard Navigation
Priority: High  
Module: TimeSeriesChart  
Status: PASSED

Description:  
Verify that users can navigate chart data points using keyboard arrow keys.

Test Steps:
1. Navigate to Graph page
2. Select a time range with data
3. Click on the chart (focus it)
4. Press Right Arrow key
5. Press Left Arrow key
6. Press Home key
7. Press End key
8. Press Escape key

Expected Result:
- Chart receives focus when clicked
- Right/Down Arrow: Moves to next data point
- Left/Up Arrow: Moves to previous data point
- Home: Jumps to first data point
- End: Jumps to last data point
- Escape: Clears selection
- Tooltip updates for each selected point
- Screen reader announces current point

Actual Result: Pass - All keyboard navigation works correctly, accessible

---

9. TC-009: Graph Page - Empty State Display
Priority: Medium  
Module: GraphPage  
Status: PASSED

Description:  
Verify that the graph page displays an appropriate empty state when no data is available.

Test Steps:
1. Navigate to Graph page
2. Select a time range with no events
3. Observe empty state

Expected Result:
- Empty state component is displayed
- Empty state shows an illustration (SVG)
- Message: "No events in the selected time range."
- Chart is not displayed

Actual Result: Pass - Empty state displays correctly

---

10. TC-010: Graph Page - Loading State
Priority: Low  
Module: GraphPage  
Status: PASSED

Description:  
Verify that a loading indicator is shown while chart data is being fetched.

Test Steps:
1. Navigate to Graph page
2. Change time range selection
3. Observe loading indicator during data fetch

Expected Result:
- Loading component appears immediately
- Loading message: "Loading…" (default) or "Loading chart…"
- Loading component has ARIA attributes (aria-busy, aria-live)
- Loading disappears when data loads

Actual Result: Pass - Loading state displays with proper accessibility

---

11. TC-011: Table Page - Display Data Table
Priority: High  
Module: TablePage, DataTable  
Status: PASSED

Description:  
Verify that the table page displays event data in a tabular format.

Test Steps:
1. Navigate to Table page (click "Table" button)
2. Verify table is displayed
3. Check table headers
4. Check table rows

Expected Result:
- Table is rendered with proper structure
- Headers are displayed (Timestamp, Attacker ID, Attacker IP, Type, Decoy, Severity)
- Data rows are displayed with event information
- Table is sortable and filterable

Actual Result: Pass - Table displays correctly with all columns and data

---

12. TC-012: Table Page - Column Filtering
Priority: High  
Module: DataTable  
Status: PASSED

Description:  
Verify that users can filter table data by column values.

Test Steps:
1. Navigate to Table page
2. Locate filter input in "Type" column
3. Type "login" in the filter input
4. Wait for debounce delay (400ms)
5. Observe filtered results

Expected Result:
- Filter input accepts text input
- After 400ms delay, table updates with filtered results
- Only rows matching the filter are displayed
- Filter is case-insensitive
- Multiple column filters can be applied simultaneously
- Screen reader announces filter changes

Actual Result: Pass - Filtering works correctly with debouncing

---

13. TC-013: Table Page - Multiple Column Filters
Priority: Medium  
Module: DataTable  
Status: PASSED

Description:  
Verify that users can apply multiple filters across different columns.

Test Steps:
1. Navigate to Table page
2. Enter "attack" in Type column filter
3. Enter "192.168" in Attacker IP column filter
4. Wait for debounce
5. Observe results

Expected Result:
- Both filters are applied (AND logic)
- Only rows matching ALL filters are displayed
- Filter values are displayed in filter inputs
- Total count updates to reflect filtered results

Actual Result: Pass - Multiple filters work correctly with AND logic

---

14. TC-014: Table Page - Column Sorting
Priority: High  
Module: DataTable  
Status: PASSED

Description:  
Verify that users can sort table data by clicking column headers.

Test Steps:
1. Navigate to Table page
2. Click on "Timestamp" column header
3. Verify sort order (ascending)
4. Click again to reverse sort (descending)
5. Verify sort indicator (▲ or ▼)

Expected Result:
- Clicking header sorts data ascending
- Second click sorts descending
- Sort indicator (▲ or ▼) is displayed
- Data is correctly sorted
- Sort state persists when changing pages
- Screen reader announces sort changes

Actual Result: Pass - Sorting works correctly with visual indicators

---

15. TC-015: Table Page - Sort by Nested Fields
Priority: Medium  
Module: DataTable  
Status: PASSED

Description:  
Verify that sorting works for nested object fields (e.g., attacker.name, decoy.name).

Test Steps:
1. Navigate to Table page
2. Click on "Attacker Name" column header
3. Verify data is sorted alphabetically
4. Click again to reverse

Expected Result:
- Data is sorted correctly by nested field
- Sort order is maintained (ascending/descending)
- Empty/null values are handled appropriately

Actual Result: Pass - Nested field sorting works correctly

---

16. TC-016: Table Page - Pagination - Next Page
Priority: High  
Module: DataTable, Pagination  
Status:  PASSED

Description:  
Verify that users can navigate to the next page of results.

Test Steps:
1. Navigate to Table page
2. Verify current page is displayed (e.g., "Page 1 of 5")
3. Click "Next" button (▶)
4. Verify page updates

Expected Result:
- Current page number increments
- Table displays next set of results
- "Previous" button becomes enabled
- "Next" button disabled if on last page
- Page number displayed: "Page X of Y"
- URL includes page parameter

Actual Result: Pass - Pagination navigation works correctly

---

17. TC-017: Table Page - Pagination - Page Size Selection
Priority: Medium  
Module: DataTable  
Status: PASSED

Description:  
Verify that users can change the number of records displayed per page.

Test Steps:
1. Navigate to Table page
2. Locate "Records per page" dropdown
3. Select "10" from dropdown
4. Verify table updates

Expected Result:
- Dropdown shows current selection
- Options available: 5, 10, 20
- Table displays selected number of rows
- Total pages recalculated
- Resets to page 1 when page size changes
- Pagination controls update

Actual Result: Pass - Page size selection works correctly

---

18. TC-018: Table Page - Empty Filter Results
Priority: Medium  
Module: DataTable  
Status: PASSED

Description:  
Verify that when filters result in no matches, empty state is shown but columns remain visible.

Test Steps:
1. Navigate to Table page
2. Apply a filter that returns no results (e.g., type "nonexistent-value")
3. Observe table display

Expected Result:
- Column headers remain visible
- Filter inputs remain visible
- Empty message: "No matching events."
- Message displayed in table body
- Settings button remains visible
- Pagination shows "Page 1 of 1"

Actual Result: Pass - Empty state shown while maintaining table structure

---

19. TC-019: Column Visibility - Select Columns
Priority: Medium  
Module: ColumnSelector  
Status: PASSED

Description:  
Verify that users can show/hide table columns using the column settings modal.

Test Steps:
1. Navigate to Table page
2. Click "⚙️ Columns" button
3. Modal opens with column checkboxes
4. Uncheck "Attacker IP" checkbox
5. Verify table updates

Expected Result:
- Modal opens with column list
- Checkboxes reflect current visibility
- Unchecking a column removes it from table
- Table headers update immediately
- Changes persist when navigating pages

Actual Result: Pass - Column visibility control works correctly

---

20. TC-020: Column Visibility - Select All / Clear All
Priority: Low  
Module: ColumnSelector  
Status: PASSED

Description:  
Verify that "Select All" and "Clear All" buttons work correctly.

Test Steps:
1. Open Column Settings modal
2. Click "Select All" button
3. Verify all columns checked
4. Click "Clear All" button
5. Verify all columns unchecked

Expected Result:
- "Select All" checks all column checkboxes
- "Clear All" unchecks all column checkboxes
- Footer shows updated count (e.g., "7 of 7 columns selected")
- Buttons have correct styling

Actual Result: Pass - Select All/Clear All functions correctly

---

21. TC-021: Error Handling - Invalid API Response
Priority: High  
Module: GraphPage, TablePage  
Status: PASSED

Description:  
Verify that the application handles API errors gracefully.

Test Steps:
1. Stop the backend services
2. Navigate to Graph or Table page
3. Attempt to load data
4. Observe error handling

Expected Result:
- Error state is displayed
- Error message is shown (e.g., "HTTP 500" or network error)
- Error component has role="alert"
- User can retry by changing time range
- Application does not crash

Actual Result: Pass - Error handling displays appropriate messages

Note: Tested by temporarily stopping services

---

22. TC-022: XSS Protection - Input Sanitization
Priority: Critical  
Module: TimeRangePicker  
Status: PASSED

Description:  
Verify that malicious scripts in date inputs are sanitized and prevented from executing.

Test Steps:
1. Open browser developer console
2. Attempt to inject script in date input (if possible through dev tools)
3. Or verify DOMPurify is being used in code
4. Check that HTML/script tags are stripped

Expected Result:
- DOMPurify sanitizes all input values
- Script tags are removed from inputs
- Only valid datetime-local format is accepted
- No XSS vulnerabilities in date inputs

Actual Result: Pass - Input sanitization implemented with DOMPurify

Verification Method: Code review confirms sanitizeInput() function usage

---

23. TC-023: Responsive Design - Mobile View
Priority: Medium  
Module: Layout, Responsive CSS  
Status: PASSED

Description:  
Verify that the application is usable on mobile devices (viewport < 768px).

Test Steps:
1. Open application in browser
2. Open developer tools
3. Set device to mobile viewport (e.g., iPhone 12)
4. Verify layout adapts
5. Test table scrolling
6. Test chart display

Expected Result:
- Header stacks vertically on mobile
- Table has horizontal scroll on mobile
- Chart scales to fit viewport
- Touch targets are at least 44x44px
- All functionality remains accessible

Actual Result: Pass - Responsive design works correctly on mobile

---

24. TC-024: Accessibility - Keyboard Navigation (Full App)
Priority: High  
Module: All Components  
Status: PASSED

Description:  
Verify that entire application is navigable using only keyboard.

Test Steps:
1. Open application
2. Use Tab key to navigate through all interactive elements
3. Use Enter/Space to activate buttons
4. Use arrow keys in chart
5. Navigate through table filters
6. Verify focus indicators are visible

Expected Result:
- All interactive elements are focusable
- Tab order is logical
- Focus indicators are clearly visible
- Enter/Space activate buttons
- Arrow keys work in chart
- Form inputs are accessible
- Skip link works

Actual Result: Pass - Full keyboard navigation verified

---

25. TC-025: Performance - Large Dataset Handling
Priority: Medium  
Module: TablePage, DataTable  
Status: PASSED

Description:  
Verify that the application handles large datasets efficiently with pagination.

Test Steps:
1. Navigate to Table page
2. Select a time range with many events (e.g., full 30-day range)
3. Verify table loads quickly
4. Test pagination with large dataset
5. Check browser performance

Expected Result:
- Table loads within acceptable time (< 2 seconds)
- Pagination works smoothly with large datasets
- Only current page is rendered (not all rows)
- No performance degradation
- Smooth scrolling and interaction

Actual Result: Pass - Large datasets handled efficiently with pagination



Test Environment

Frontend:  
- URL: http://localhost:5173
- Framework: React 18.3.1 + TypeScript + Vite
- Browser: Chrome 120+ / Firefox 121+ / Safari 17+

Backend Services:  
- Graph Service: http://localhost:4001
- Table Service: http://localhost:4002

Test Data:  
- Source: `backend/services/Data.json`
- Time Range: August 04, 2021 - August 25, 2021


Summary

Total Defects: 0

No defects found during functional testing.


1. All critical and high-priority test cases passed
2. Application is production-ready
3. All accessibility requirements met
4. Security measures (XSS protection) verified
5. Performance optimizations working as expected

Sign-off

