import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: '#3C3C43', letterSpacing: '-0.1px' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          background: 'rgba(120,120,128,0.08)',
          border: error ? '1px solid #FF3B30' : '1px solid transparent',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 15,
          color: '#1C1C1E',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          width: '100%',
          ...style,
        }}
        onFocus={e => {
          e.target.style.background = '#fff';
          e.target.style.border = '1px solid #007AFF';
        }}
        onBlur={e => {
          e.target.style.background = 'rgba(120,120,128,0.08)';
          e.target.style.border = error ? '1px solid #FF3B30' : '1px solid transparent';
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: '#FF3B30' }}>{error}</span>}
    </div>
  ),
);
Input.displayName = 'Input';
