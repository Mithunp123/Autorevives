import { cn } from '@/utils';
import { useWindowSize } from '@/hooks';

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  onRowClick,
  className,
}) {
  const { isMobile } = useWindowSize();

  if (loading) {
    return (
      <div className="card p-10">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl border-[3px] border-slate-100 border-t-accent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-8 sm:p-14 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border border-slate-100">
          <i className="fas fa-inbox text-xl sm:text-2xl text-slate-300"></i>
        </div>
        <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {data.map((row, idx) => (
          <div
            key={row.id || idx}
            className={cn('card p-3 space-y-2', onRowClick && 'cursor-pointer active:bg-slate-50 active:scale-[0.99] transition-transform')}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">{col.label}</span>
                <span className="text-xs text-slate-800 text-right font-medium min-w-0">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '\u2014'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'font-bold px-6 py-4',
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={cn(
                  'hover:bg-slate-50/80 transition-colors group',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns
                  .filter((c) => !c.hideOnMobile)
                  .map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-6 py-4 text-slate-600', col.className)}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '\u2014'}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
