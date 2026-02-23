import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { cn } from '@/utils';

const adminItems = [
  { to: '/dashboard', label: 'Home', icon: 'fa-gauge-high' },
  { to: '/vehicles', label: 'Vehicles', icon: 'fa-car-side' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/users', label: 'Users', icon: 'fa-user-group' },
  { to: '/settings', label: 'More', icon: 'fa-sliders' },
];

const officeItems = [
  { to: '/dashboard', label: 'Home', icon: 'fa-gauge-high' },
  { to: '/vehicles', label: 'Vehicles', icon: 'fa-car-side' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/settings', label: 'More', icon: 'fa-sliders' },
];

const userItems = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/public/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/profile', label: 'Profile', icon: 'fa-circle-user' },
  { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
];

export default function MobileNav() {
  const { isAdmin, isOffice } = useAuth();
  const location = useLocation();
  const items = isAdmin ? adminItems : isOffice ? officeItems : userItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom">
      <div className="mx-3 mb-3 bg-charcoal rounded-2xl shadow-elevated border border-white/[0.06]">
        <div className="flex items-center justify-around h-16 px-1">
          {items.map(({ to, label, icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl min-w-[52px] transition-all relative',
                  isActive ? 'text-white' : 'text-white/35'
                )}
              >
                {isActive && (
                  <div className="absolute -top-0.5 w-8 h-1 bg-accent rounded-full" />
                )}
                <div className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                  isActive && 'bg-accent/20'
                )}>
                  <i className={cn(`fas ${icon} text-sm`, isActive && 'text-accent-light')}></i>
                </div>
                <span className="text-xs font-bold">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
