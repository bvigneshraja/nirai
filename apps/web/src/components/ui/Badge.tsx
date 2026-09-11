interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const styles = {
  success: { background: 'rgba(52,199,89,0.12)',  color: '#1A7F37' },
  warning: { background: 'rgba(255,149,0,0.12)',  color: '#B25000' },
  danger:  { background: 'rgba(255,59,48,0.12)',  color: '#D70015' },
  info:    { background: 'rgba(0,122,255,0.12)',  color: '#0055CC' },
  default: { background: 'rgba(120,120,128,0.12)', color: '#3C3C43' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '-0.1px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
