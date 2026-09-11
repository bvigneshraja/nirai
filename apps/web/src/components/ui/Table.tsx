import { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function Table<T>({ columns, data, loading, keyExtractor, sortBy, sortOrder, onSort }: TableProps<T>) {
  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    if (sortBy !== col.key) return <ChevronsUpDown size={13} style={{ marginLeft: 4, color: '#C7C7CC', flexShrink: 0 }} />;
    return sortOrder === 'asc'
      ? <ChevronUp size={13} style={{ marginLeft: 4, color: '#007AFF', flexShrink: 0 }} />
      : <ChevronDown size={13} style={{ marginLeft: 4, color: '#007AFF', flexShrink: 0 }} />;
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* Horizontal scroll wrapper for small screens */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 500 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(60,60,67,0.1)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: sortBy === col.key ? '#007AFF' : '#8E8E93',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    background: 'rgba(120,120,128,0.04)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {col.header}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center', color: '#8E8E93', fontSize: 14 }}>Loading…</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center', color: '#8E8E93', fontSize: 14 }}>No records found</td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  style={{ borderBottom: idx < data.length - 1 ? '1px solid rgba(60,60,67,0.08)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,122,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '12px 16px', color: '#1C1C1E', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
