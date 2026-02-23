import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { cn } from '@/utils';

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high', section: 'Overview' },
  { to: '/vehicles', label: 'Products', icon: 'fa-car-side', section: 'Overview' },
  { to: '/users', label: 'Users', icon: 'fa-user-group', section: 'Overview' },
  { to: '/offices', label: 'Offices', icon: 'fa-building', section: 'Management' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel', section: 'Management' },
  { to: '/approvals', label: 'Approvals', icon: 'fa-clipboard-check', section: 'Management' },
  { to: '/reports', label: 'Reports', icon: 'fa-chart-pie', section: 'Management' },
  { to: '/settings', label: 'Settings', icon: 'fa-sliders', section: 'System' },
];

const officeNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high', section: 'Main' },
  { to: '/vehicles/add', label: 'Add Product', icon: 'fa-circle-plus', section: 'Main' },
  { to: '/vehicles', label: 'My Vehicles', icon: 'fa-car-side', section: 'Main' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel', section: 'Browse' },
  { to: '/office-profile', label: 'Office Profile', icon: 'fa-building-circle-check', section: 'Settings' },
];

const userNav = [
  { to: '/', label: 'Home', icon: 'fa-house', section: 'Main' },
  { to: '/public/auctions', label: 'Auctions', icon: 'fa-gavel', section: 'Main' },
  { to: '/profile', label: 'Profile', icon: 'fa-circle-user', section: 'Account' },
  { to: '/about', label: 'About', icon: 'fa-info-circle', section: 'Links' },
  { to: '/contact', label: 'Contact', icon: 'fa-envelope', section: 'Links' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, isAdmin, isOffice } = useAuth();
  const location = useLocation();
  const navItems = isAdmin ? adminNav : isOffice ? officeNav : userNav;

  const sections = [...new Set(navItems.map((i) => i.section))];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-out',
          'bg-gradient-to-b from-charcoal to-navy border-r border-white/[0.06]',
          'lg:z-30',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[272px]',
          isOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-[72px] border-b border-white/[0.06] px-5',
          collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src="/images/Logo.png" alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-[#202124]'); }} />
            </div>
            {!collapsed && (
              <div className="lg:block">
                <h1 className="text-white font-display font-extrabold text-lg tracking-tight leading-none">
                  Auto<span className="text-accent">Revive</span>
                </h1>
                <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase mt-0.5">Premium Auctions</p>
              </div>
            )}
          </div>

          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <i className="fas fa-xmark text-lg"></i>
          </button>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-7 h-7 items-center justify-center text-white/25 hover:text-white/60 rounded-md hover:bg-white/5 transition-all"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {sections.map((section) => (
            <div key={section}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                  {section}
                </p>
              )}
              <div className="space-y-0.5">
                {navItems
                  .filter((i) => i.section === section)
                  .map(({ to, label, icon }) => {
                    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative',
                          collapsed && 'lg:justify-center lg:px-0',
                          isActive
                            ? 'bg-gradient-to-r from-accent/20 to-primary-400/10 text-white'
                            : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                        )}
                        title={collapsed ? label : undefined}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
                        )}
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                          isActive
                            ? 'bg-accent/20 text-accent-light'
                            : 'text-white/35 group-hover:text-white/60'
                        )}>
                          <i className={cn(`fas ${icon} text-sm`)}></i>
                        </div>
                        {!collapsed && <span>{label}</span>}
                      </NavLink>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className={cn(
          'border-t border-white/[0.06] p-4',
          collapsed && 'lg:p-2 lg:flex lg:justify-center'
        )}>
          <div className={cn('flex items-center gap-3', collapsed && 'lg:gap-0')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-primary-400/20 flex items-center justify-center flex-shrink-0 text-accent-light text-sm font-bold ring-1 ring-white/[0.08]">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{user?.username || 'Admin'}</p>
                <p className="text-white/30 text-[11px] font-medium capitalize">{user?.role || 'admin'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
