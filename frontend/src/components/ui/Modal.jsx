import { cn } from '@/utils';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100%-2rem)]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-100',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 font-display">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
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
