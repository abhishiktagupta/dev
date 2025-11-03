# Event Analytics - React + TypeScript + Node.js Microservices

A small full-stack app demonstrating a time-series graph and a data table with sorting, filtering, and pagination. The backend uses two microservices and reads data from a local JSON file.

## Stack
- Frontend: React + TypeScript + Vite + CSS (no UI library)
- Backend: Node.js + TypeScript + Express (two microservices)
- Testing: Vitest + React Testing Library (skeleton provided)
- State: React Context + useReducer (clear separation of concerns)

## Features
- Graph page: time-series event counts over a selectable time range
- Table page: paginated, sortable, filterable table of events
- Column visibility selector with default columns
- Server-side sorting/filtering/pagination (via table-service)
- Responsive layout, loading and empty states
- Performant renders using memoization where appropriate

## Project Structure
```
.
├── backend
│   └── services
│       ├── graph-service
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── src
│       │       ├── index.ts
│       │       ├── lib
│       │       │   └── dataLoader.ts
│       │       └── types.ts
│       └── table-service
│           ├── package.json
│           ├── tsconfig.json
│           └── src
│               ├── index.ts
│               ├── lib
│               │   └── dataLoader.ts
│               └── types.ts
├── backend
│   └── services
│       ├── Data.json
│       ├── graph-service
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── src
│       │       ├── index.ts
│       │       ├── lib
│       │       │   └── dataLoader.ts
│       │       └── types.ts
│       └── table-service
│           ├── package.json
│           ├── tsconfig.json
│           └── src
│               ├── index.ts
│               ├── lib
│               │   └── dataLoader.ts
│               └── types.ts
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles
│       │   ├── style.css
│       │   └── theme.css
│       ├── hooks
│       │   ├── useDebounce.ts
│       │   └── useFetch.ts
│       ├── store
│       │   └── timeRangeContext.tsx
│       ├── components
│       │   ├── ColumnSelector.tsx
│       │   ├── DataTable.tsx
│       │   ├── Loading.tsx
│       │   ├── Empty.tsx
│       │   ├── Modal.tsx
│       │   ├── Pagination.tsx
│       │   ├── TimeRangePicker.tsx
│       │   └── TimeSeriesChart.tsx
│       └── routes
│           ├── GraphPage.tsx
│           └── TablePage.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+

### Install and run backend
In two terminals (or run sequentially):

```bash
# Graph service (port 4001)
cd backend/services/graph-service
npm install
npm run dev
```

```bash
# Table service (port 4002)
cd backend/services/table-service
npm install
npm run dev
```

### Install and run frontend
```bash
cd frontend
npm install
npm run dev
```
Open the printed URL (typically `http://localhost:5173`).

## Testing

### Running Tests

#### Frontend Tests

```bash
cd frontend
npm test
```

**Test Commands:**

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Results:**
- **14 Test Suites** - All passing
- **111 Tests** - Comprehensive coverage
- **Framework**: Jest + React Testing Library
- **Test Time**: ~2 seconds

**Test Coverage Includes:**
- Component unit tests (DataTable, TimeSeriesChart, TimeRangePicker, Pagination, Modal, etc.)
- Hook tests (useFetch, useDebounce)
- Integration tests (TablePage, GraphPage)
- Accessibility tests (keyboard navigation, ARIA attributes)
- Store/context tests (timeRangeContext)

#### Example Test Output

```
PASS src/test/components/DataTable.test.tsx
PASS src/test/components/TimeSeriesChart.test.tsx
PASS src/test/components/TimeRangePicker.test.tsx
PASS src/test/components/Pagination.test.tsx
PASS src/test/routes/TablePage.test.tsx
PASS src/test/routes/GraphPage.test.tsx
PASS src/test/App.test.tsx
...

Test Suites: 14 passed, 14 total
Tests:       111 passed, 111 total
Time:        1.998 s
```

### Writing Tests

Tests are located in `frontend/src/test/` directory, mirroring the source structure.

**Example Test Structure:**
```
src/test/
├── components/
│   ├── DataTable.test.tsx
│   ├── TimeSeriesChart.test.tsx
│   └── ...
├── routes/
│   ├── TablePage.test.tsx
│   └── GraphPage.test.tsx
├── hooks/
│   ├── useFetch.test.ts
│   └── useDebounce.test.ts
└── utils.tsx (test utilities)
```

## API
- Graph service:
  - GET `http://localhost:4001/events/count?start=ISO&end=ISO`
  - Response: `{ buckets: [{ timestamp: ISO, count: number }], total: number }`
- Table service:
  - GET `http://localhost:4002/events?start=ISO&end=ISO&page=1&pageSize=20&sort=timestamp:desc&filters=attacker.ip:1.2.3.4,type:login`
  - Response: `{ items, page, pageSize, total, totalPages }`

## Bonus Choices
- Architecture & State Management
  - Chosen: React Context + useReducer for app-wide time range and column visibility. Rationale: lightweight, zero dependencies, sufficient global state needs, and explicit control over actions. UI and logic separated via `routes`, `components`, and `hooks`.
- Performance Optimization
  - Chosen: useMemo/useCallback and React.memo where it matters (chart path calculation, table rows, and derived column lists) to avoid unnecessary re-renders.
- Advanced UI/UX
  - Added loading and empty states, keyboard-focusable controls, and responsive layout. Subtle CSS transitions on table hover.
- Testing
  - Included test scaffolding (Vitest + RTL) and a sample unit test for filtering logic. Extend as needed.

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
This generates optimized production build in `frontend/dist/`.

### Backend Services
```bash
# Build graph-service
cd backend/services/graph-service
npm run build

# Build table-service
cd ../table-service
npm run build
```

### Production Run
```bash
# Set NODE_ENV=production
export NODE_ENV=production

# Start services (from built dist/)
cd backend/services/graph-service
npm start

cd ../table-service
npm start

# Serve frontend (use any static server)
cd frontend
npm run preview
# or deploy dist/ to your hosting service
```

## Notes
- Data file is located at `backend/services/Data.json`
- If you prefer a single backend, you can merge the two services—endpoints and logic are isolated.
- Debug console logs are disabled in production builds.
