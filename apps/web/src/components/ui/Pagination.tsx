import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const btn = (content: React.ReactNode, onClick: () => void, disabled: boolean, active = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 32, height: 32, padding: '0 8px',
        borderRadius: 8, border: 'none', cursor: disabled ? 'default' : 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 400,
        background: active ? '#007AFF' : disabled ? 'transparent' : 'rgba(120,120,128,0.08)',
        color: active ? '#fff' : disabled ? '#C7C7CC' : '#1C1C1E',
        transition: 'background 0.15s',
      }}
    >
      {content}
    </button>
  );

  const pages: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#8E8E93' }}>{from}–{to} of {total}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {btn(<ChevronLeft size={14} />, () => onChange(page - 1), page === 1)}
        {pages[0] > 1 && <>{btn('1', () => onChange(1), false)}{pages[0] > 2 && <span style={{ color: '#C7C7CC', padding: '0 2px' }}>…</span>}</>}
        {pages.map(p => btn(String(p), () => onChange(p), false, p === page))}
        {pages[pages.length - 1] < totalPages && <>{pages[pages.length - 1] < totalPages - 1 && <span style={{ color: '#C7C7CC', padding: '0 2px' }}>…</span>}{btn(String(totalPages), () => onChange(totalPages), false)}</>}
        {btn(<ChevronRight size={14} />, () => onChange(page + 1), page === totalPages)}
      </div>
    </div>
  );
}
