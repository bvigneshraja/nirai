import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales Entry', icon: Receipt },
  { to: '/balance', label: 'Customer Balance', icon: Wallet },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="flex h-full w-60 flex-col"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(60,60,67,0.12)',
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 gap-3" style={{ borderBottom: '1px solid rgba(60,60,67,0.08)' }}>
        <img src="/nirai-logo.svg" alt="Nirai" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,80,213,0.22)' }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.4px' }}>
          Nirai
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-apple px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-apple-blue text-white shadow-apple-sm'
                  : 'text-apple-label hover:bg-black/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(60,60,67,0.08)', paddingTop: 12 }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold"
            style={{ background: '#007AFF' }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#8E8E93' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-apple px-3 py-2 text-sm transition-colors hover:bg-black/5"
          style={{ color: '#FF3B30', fontWeight: 400 }}
        >
          <LogOut size={16} strokeWidth={1.8} />
          <span style={{ fontSize: 14 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
