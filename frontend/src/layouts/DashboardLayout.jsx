import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { cn } from '@/utils';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  const handleMenuClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(true);
    } else {
      setCollapsed((c) => !c);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-alt">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div
        className={cn(
          'transition-all duration-300 ease-out',
          collapsed ? 'lg:ml-[76px]' : 'lg:ml-[272px]'
        )}
      >
        <TopBar onMenuClick={handleMenuClick} collapsed={collapsed} />

        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
