import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { cn } from '@/utils';

const adminItems = [
  { to: '/dashboard', label: 'Home', icon: 'fa-house' },
  { to: '/vehicles', label: 'Vehicles', icon: 'fa-car' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/settings', label: 'More', icon: 'fa-bars' },
];

const officeItems = [
  { to: '/dashboard', label: 'Home', icon: 'fa-house' },
  { to: '/vehicles', label: 'Vehicles', icon: 'fa-car' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/settings', label: 'More', icon: 'fa-bars' },
];

const userItems = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/auctions', label: 'Auctions', icon: 'fa-gavel' },
  { to: '/profile', label: 'Profile', icon: 'fa-user' },
  { to: '/contact', label: 'Contact', icon: 'fa-envelope' },
];

export default function MobileNav() {
  const { isAdmin, isOffice } = useAuth();
  const location = useLocation();
  const items = isAdmin ? adminItems : isOffice ? officeItems : userItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[60px] px-2 max-w-lg mx-auto safe-bottom">
          {items.map(({ to, label, icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 relative transition-colors',
                  isActive ? 'text-gold-600' : 'text-gray-400'
                )}
              >
                <div className={cn(
                  'w-10 h-8 flex items-center justify-center rounded-full transition-all',
                  isActive && 'bg-gold-50'
                )}>
                  <i className={cn(`fas ${icon}`, isActive ? 'text-base' : 'text-[15px]')}></i>
                </div>
                <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
