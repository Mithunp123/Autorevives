import { useAuth } from '@/context';

export default function TopBar({ onMenuClick, collapsed }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 glass border-b border-slate-200/60">
      <div className="flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="btn-icon lg:hidden"
            aria-label="Toggle menu"
          >
            <i className="fas fa-bars-staggered text-lg"></i>
          </button>

          {collapsed && (
            <button
              onClick={onMenuClick}
              className="hidden lg:flex btn-icon"
              aria-label="Expand sidebar"
            >
              <i className="fas fa-chevron-right text-sm text-slate-400"></i>
            </button>
          )}

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-alt rounded-xl px-4 py-2.5 w-80 border border-slate-200/60 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10 focus-within:bg-white transition-all duration-200">
            <i className="fas fa-magnifying-glass text-slate-400 text-[13px]"></i>
            <input
              type="text"
              placeholder="Search vehicles, users, auctions..."
              aria-label="Search vehicles, users, auctions"
              className="bg-transparent text-sm flex-1 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            />
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white text-[10px] font-mono font-semibold text-slate-400 border border-slate-200">/</kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">

          <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />

          {/* User */}
          <div className="hidden sm:flex items-center gap-3 pl-1">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-500 font-medium capitalize">{user?.role || 'admin'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#202124] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-accent/20 ring-2 ring-white">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="btn-icon text-slate-400 hover:text-danger hover:bg-red-50"
            aria-label="Logout"
            title="Logout"
          >
            <i className="fas fa-arrow-right-from-bracket text-lg"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
