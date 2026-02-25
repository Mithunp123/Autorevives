import { cn } from '@/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-4', className)}>
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-6 border border-slate-100">
          <Icon className="w-10 h-10 text-slate-300" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800 mb-1.5 font-display">{title}</h3>
      {description && <p className="text-sm text-slate-400 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
