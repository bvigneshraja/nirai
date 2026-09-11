import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header
      style={{
        display: 'flex',
        height: 56,
        alignItems: 'center',
        padding: '0 24px',
        gap: 12,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(60,60,67,0.12)',
        flexShrink: 0,
      }}
    >
      {/* Hamburger — visible only on mobile */}
      <button
        onClick={onMenuClick}
        className="hamburger-btn"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, color: '#1C1C1E', display: 'flex', alignItems: 'center',
        }}
        aria-label="Open menu"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      <h1 style={{ fontSize: 17, fontWeight: 600, color: '#1C1C1E', letterSpacing: '-0.2px', margin: 0 }}>
        {title}
      </h1>

      <style>{`
        @media (min-width: 768px) { .hamburger-btn { display: none !important; } }
        @media (max-width: 767px) { .hamburger-btn { display: flex !important; } }
      `}</style>
    </header>
  );
}
