import { cn } from '@/utils';

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  className,
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      <div className="relative flex-1 max-w-md">
        <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field pl-11 pr-10"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <i className="fas fa-circle-xmark text-sm"></i>
          </button>
        )}
      </div>

      {filters.map(({ key, label, options, value, onChange }) => (
        <select
          key={key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-field w-full sm:w-48"
        >
          <option value="">{label}</option>
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
