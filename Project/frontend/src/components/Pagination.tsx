type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <nav className="pagination" role="navigation" aria-label="Pagination">
      <button 
        className="btn-icon" 
        onClick={() => onPageChange(1)} 
        disabled={page <= 1} 
        aria-label="First page"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : 0}
      >
        <span aria-hidden="true">⏮</span>
      </button>
      <button 
        className="btn-icon" 
        onClick={() => onPageChange(page - 1)} 
        disabled={page <= 1} 
        aria-label="Previous page"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : 0}
      >
        <span aria-hidden="true">◀</span>
      </button>
      <span className="pagination-info" aria-live="polite" aria-atomic="true">
        Page <span aria-current="page">{page}</span> of {totalPages}
      </span>
      <button 
        className="btn-icon" 
        onClick={() => onPageChange(page + 1)} 
        disabled={page >= totalPages} 
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : 0}
      >
        <span aria-hidden="true">▶</span>
      </button>
      <button 
        className="btn-icon" 
        onClick={() => onPageChange(totalPages)} 
        disabled={page >= totalPages} 
        aria-label="Last page"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : 0}
      >
        <span aria-hidden="true">⏭</span>
      </button>
    </nav>
  );
}
