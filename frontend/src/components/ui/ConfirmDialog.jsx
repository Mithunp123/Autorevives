import { cn } from '@/utils';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-sm w-full p-7 animate-scale-in border border-slate-100">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
          <i className={`fas ${variant === 'danger' ? 'fa-triangle-exclamation text-danger' : 'fa-circle-question text-accent'} text-xl`}></i>
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center mb-2 font-display">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-7 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(variant === 'danger' ? 'btn-danger' : 'btn-primary', 'flex-1')}
            disabled={loading}
          >
            {loading ? <><i className="fas fa-circle-notch fa-spin mr-1.5"></i>Processing...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
