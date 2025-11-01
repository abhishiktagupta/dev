export default function Loading({ label = 'Loading…' }: { label?: string }) {
  return <div role="status" aria-live="polite" className="panel loading">{label}</div>;
}
