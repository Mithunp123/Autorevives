import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/utils';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  const modalRef = useRef(null);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  // Focus trap and escape handler
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Focus the modal when opened
    const timer = setTimeout(() => modalRef.current?.focus(), 50);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100%-2rem)]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-100',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 id="modal-title" className="text-lg font-bold text-slate-900 font-display">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
