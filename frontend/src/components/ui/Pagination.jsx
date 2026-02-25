import { cn } from '@/utils';

export default function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-center gap-1.5 mt-6 flex-wrap', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary px-3.5 py-2 text-xs disabled:opacity-30"
      >
        <i className="fas fa-chevron-left text-[10px] mr-1"></i>Prev
      </button>

      {pages[0] > 1 && (
        <>
          <PageBtn page={1} current={currentPage} onClick={onPageChange} />
          {pages[0] > 2 && <span className="px-1.5 text-slate-300 text-sm">...</span>}
        </>
      )}

      {pages.map((page) => (
        <PageBtn key={page} page={page} current={currentPage} onClick={onPageChange} />
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1.5 text-slate-300 text-sm">...</span>}
          <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary px-3.5 py-2 text-xs disabled:opacity-30"
      >
        Next<i className="fas fa-chevron-right text-[10px] ml-1"></i>
      </button>
    </div>
  );
}

function PageBtn({ page, current, onClick }) {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        'w-9 h-9 rounded-xl text-sm font-bold transition-all',
        page === current
          ? 'bg-accent text-white shadow-button'
          : 'text-slate-500 hover:bg-slate-100'
      )}
    >
      {page}
    </button>
  );
}
