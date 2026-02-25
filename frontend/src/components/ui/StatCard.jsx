import { cn } from '@/utils';

const borderColors = {
  accent: 'border-l-gold-500',
  success: 'border-l-emerald-500',
  danger: 'border-l-red-500',
  warning: 'border-l-amber-500',
  purple: 'border-l-violet-500',
  navy: 'border-l-slate-500',
};

const iconColors = {
  accent: 'text-gold-500',
  success: 'text-emerald-500',
  danger: 'text-red-500',
  warning: 'text-amber-500',
  purple: 'text-violet-500',
  navy: 'text-slate-500',
};

export default function StatCard({ icon, label, value, change, changeType, color = 'accent', className }) {
  return (
    <div className={cn(
      'bg-white rounded-lg p-3 sm:p-4 border border-gray-100 border-l-[3px] shadow-sm hover:shadow-md transition-all duration-300',
      borderColors[color],
      className
    )}>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        {icon && <i className={cn(`fas ${icon} text-xs sm:text-sm`, iconColors[color])}></i>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate leading-none">{value}</p>
        {change !== undefined && (
          <span
            className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-0.5',
              changeType === 'up'
                ? 'text-emerald-600'
                : 'text-red-600'
            )}
          >
            <i className={`fas ${changeType === 'up' ? 'fa-caret-up' : 'fa-caret-down'} text-[10px]`}></i>
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
