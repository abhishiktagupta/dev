export default function Empty({ message = 'No data' }: { message?: string }) {
  return <div role="status" aria-live="polite" className="panel empty-state">{message}</div>;
}
