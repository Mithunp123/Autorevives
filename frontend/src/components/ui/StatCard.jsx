import { cn } from '@/utils';

export default function StatCard({ icon, label, value, change, changeType, color = 'accent', className }) {
  const iconStyles = {
    accent: 'bg-gradient-to-br from-primary-100 to-primary-50 text-accent',
    success: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600',
    danger: 'bg-gradient-to-br from-red-100 to-red-50 text-red-600',
    warning: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600',
    purple: 'bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600',
  };

  return (
    <div className={cn('stat-card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconStyles[color])}>
          {icon && <i className={`fas ${icon} text-lg`}></i>}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1',
              changeType === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            <i className={`fas ${changeType === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]`}></i>
            {change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}
