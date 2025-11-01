import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { TimeRangeProvider } from './store/timeRangeContext';
import Loading from './components/Loading';

// Lazy load route components for code splitting
const GraphPage = lazy(() => import('./routes/GraphPage'));
const TablePage = lazy(() => import('./routes/TablePage'));

export default function App() {
  return (
    <TimeRangeProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="container">
        <header className="app-header">
          <h1>Event Analytics</h1>
          <nav role="navigation" aria-label="Main navigation">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => (isActive ? 'active' : '')}
              aria-label="Graph view"
            >
              Graph
            </NavLink>
            <NavLink 
              to="/table" 
              className={({ isActive }) => (isActive ? 'active' : '')}
              aria-label="Table view"
            >
              Table
            </NavLink>
          </nav>
        </header>
        <main id="main-content" role="main">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<GraphPage />} />
              <Route path="/table" element={<TablePage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </TimeRangeProvider>
  );
}
