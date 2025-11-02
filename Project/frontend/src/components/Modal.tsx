import { memo, useEffect, useCallback, type ReactNode } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

function Modal({ isOpen, onClose, title, children }: Props) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            onClick={onClose} 
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            aria-label="Close modal" 
            aria-controls="modal-title"
            className="modal-close"
            tabIndex={0}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default memo(Modal, (prevProps, nextProps) => 
  prevProps.isOpen === nextProps.isOpen && prevProps.title === nextProps.title
);

