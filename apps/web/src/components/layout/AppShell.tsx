import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const titleMap: Record<string, string> = {
  '/':          'Dashboard',
  '/customers': 'Customers',
  '/products':  'Products',
  '/purchases': 'Purchases',
  '/sales':     'Sales Entry',
  '/balance':   'Customer Balance',
};

export function AppShell() {
  const { pathname } = useLocation();
  const title = titleMap[pathname] ?? 'Nirai';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F2F2F7', position: 'relative' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 40, display: 'block',
          }}
          className="md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          width: 240,
        }}
        className="sidebar-mobile"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar (always visible ≥768px) */}
      <div
        style={{ flexShrink: 0, width: 240 }}
        className="sidebar-desktop"
      >
        <Sidebar />
      </div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-mobile { display: none !important; }
          .sidebar-desktop { display: block !important; }
        }
        @media (max-width: 767px) {
          .sidebar-mobile { display: block !important; transform: translateX(${sidebarOpen ? '0' : '-100%'}); }
          .sidebar-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
