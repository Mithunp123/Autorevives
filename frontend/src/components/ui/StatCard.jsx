import { cn } from '@/utils';

export default function StatCard({ icon, label, value, change, changeType, color = 'accent', className }) {
  const iconStyles = {
    accent: 'bg-gradient-to-br from-blue-100 to-blue-50 text-accent',
    success: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600',
    danger: 'bg-gradient-to-br from-red-100 to-red-50 text-red-600',
    warning: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600',
    purple: 'bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600',
    navy: 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700',
  };

  return (
    <div className={cn('bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#4285F4]/30 transition-all duration-300 group', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110', iconStyles[color])}>
          {icon && <i className={`fas ${icon} text-xl`}></i>}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5',
              changeType === 'up'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            )}
          >
            <i className={`fas ${changeType === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
            {change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 truncate">{value}</p>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
