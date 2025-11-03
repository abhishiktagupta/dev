// Empty state illustration SVG
const EmptyIllustration = () => (
  <svg 
    width="200" 
    height="200" 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="empty-illustration"
  >
    {/* Background circle */}
    <circle cx="100" cy="100" r="80" fill="var(--bg-tertiary)" opacity="0.3" />
    
    {/* Document/Table icon */}
    <rect x="70" y="60" width="60" height="80" rx="4" fill="none" stroke="var(--text-muted)" strokeWidth="2" opacity="0.4" />
    <line x1="80" y1="80" x2="130" y2="80" stroke="var(--text-muted)" strokeWidth="2" opacity="0.3" />
    <line x1="80" y1="100" x2="130" y2="100" stroke="var(--text-muted)" strokeWidth="2" opacity="0.3" />
    <line x1="80" y1="120" x2="110" y2="120" stroke="var(--text-muted)" strokeWidth="2" opacity="0.3" />
    
    {/* Search/Magnifying glass */}
    <circle cx="140" cy="70" r="15" fill="none" stroke="var(--zscaler-cyan)" strokeWidth="2.5" opacity="0.7" />
    <line x1="150" y1="80" x2="160" y2="90" stroke="var(--zscaler-cyan)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    
    {/* Small data points */}
    <circle cx="85" cy="90" r="2" fill="var(--text-muted)" opacity="0.3" />
    <circle cx="85" cy="110" r="2" fill="var(--text-muted)" opacity="0.3" />
    <circle cx="105" cy="90" r="2" fill="var(--text-muted)" opacity="0.3" />
    <circle cx="105" cy="110" r="2" fill="var(--text-muted)" opacity="0.3" />
  </svg>
);

export default function Empty({ message = 'No data' }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" className="panel empty-state">
      <EmptyIllustration />
      <p className="empty-message">{message}</p>
    </div>
  );
}
