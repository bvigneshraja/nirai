import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const styles = {
  primary:   { background: '#007AFF', color: '#fff', border: 'none' },
  secondary: { background: 'rgba(120,120,128,0.12)', color: '#007AFF', border: 'none' },
  danger:    { background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: 'none' },
  ghost:     { background: 'transparent', color: '#007AFF', border: 'none' },
};

const sizes = {
  sm: { padding: '5px 12px', fontSize: 13, borderRadius: 8 },
  md: { padding: '8px 16px', fontSize: 15, borderRadius: 10 },
  lg: { padding: '13px 20px', fontSize: 17, borderRadius: 12 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        ...sizes[size],
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity 0.15s, transform 0.1s',
        outline: 'none',
        letterSpacing: '-0.1px',
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
      )}
      {children}
    </button>
  );
}
