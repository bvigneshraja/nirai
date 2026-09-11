import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
} from 'recharts';

interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  salesToday: { amount: number; count: number };
  totalRevenue: number;
  totalOutstanding: number;
  totalCostOfGoods: number;
  totalMargin: number;
  totalPurchaseSpend: number;
  marginPercent: number;
  lowStockProducts: { id: string; name: string; stock: number; unit: string }[];
  recentSales: { id: string; totalAmount: number; soldAt: string; customer?: { name: string } }[];
  salesTrend: { date: string; sales: number; cost: number; margin: number; purchases: number }[];
  productMargins: { name: string; revenue: number; cost: number; margin: number; marginPct: number; qty: number }[];
  topCustomers: { name: string; outstanding: number; revenue: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtShort = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid rgba(60,60,67,0.15)',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
};

function StatCard({ label, value, sub, accent, trend }: {
  label: string; value: string; sub?: string; accent: string; trend?: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
      borderTop: `3px solid ${accent}`,
    }}>
      <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1C1C1E', margin: '6px 0 0', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#8E8E93', margin: '4px 0 0' }}>{sub}</p>}
      {trend && <p style={{ fontSize: 12, color: trend.startsWith('-') ? '#FF3B30' : '#34C759', margin: '4px 0 0', fontWeight: 500 }}>{trend}</p>}
    </div>
  );
}

function SectionCard({ title, children, fullWidth, subtitle }: {
  title: string; children: React.ReactNode; fullWidth?: boolean; subtitle?: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(60,60,67,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', margin: 0 }}>{title}</h3>
        {subtitle && <span style={{ fontSize: 12, color: '#8E8E93' }}>{subtitle}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8E8E93', fontSize: 15 }}>
        Loading…
      </div>
    );
  }

  if (!data) return null;

  const trendData = data.salesTrend.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    marginPct: d.cost > 0 ? Math.round(((d.margin) / d.cost) * 100 * 10) / 10 : 0,
  }));

  const totalRevenue = data.totalRevenue || 1;
  const marginOfRevenue = Math.round((data.totalMargin / totalRevenue) * 100 * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .kpi-grid { grid-template-columns: repeat(4, 1fr); }
        .col-2 { grid-template-columns: 1fr 1fr; }
        .col-3 { grid-template-columns: 1fr 1fr 1fr; }
        .col-3-1 { grid-template-columns: 2fr 1fr; }
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .col-2, .col-3, .col-3-1 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* KPI Cards — row 1 */}
      <div className="kpi-grid" style={{ display: 'grid', gap: 12 }}>
        <StatCard label="Total Revenue" value={fmt(data.totalRevenue)} accent="#007AFF"
          sub={`${data.salesToday.count} sale${data.salesToday.count !== 1 ? 's' : ''} today`} />
        <StatCard label="Overall Margin" value={fmt(data.totalMargin)} accent="#34C759"
          trend={`+${data.marginPercent}% on cost · ${marginOfRevenue}% of revenue`} />
        <StatCard label="Outstanding" value={fmt(data.totalOutstanding)} accent="#FF9500"
          sub="Total owed by customers" />
        <StatCard label="Purchase Spend" value={fmt(data.totalPurchaseSpend)} accent="#AF52DE"
          sub={`Cost of goods: ${fmt(data.totalCostOfGoods)}`} />
      </div>

      {/* KPI Cards — row 2 */}
      <div className="kpi-grid" style={{ display: 'grid', gap: 12 }}>
        <StatCard label="Customers" value={String(data.totalCustomers)} accent="#5AC8FA" />
        <StatCard label="Products" value={String(data.totalProducts)} accent="#FF2D55" />
        <StatCard label="Sales Today" value={fmt(data.salesToday.amount)} accent="#FF9500"
          sub={`${data.salesToday.count} orders`} />
        <StatCard label="Avg Margin %" value={`${data.marginPercent}%`} accent="#34C759"
          sub="On cost of goods" />
      </div>

      {/* ── OVERALL MARGIN breakdown ── */}
      <SectionCard title="Overall Margin Breakdown" subtitle={`${data.marginPercent}% margin on cost`}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Stacked bar visual */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ height: 32, borderRadius: 8, overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
              <div style={{ width: `${(data.totalCostOfGoods / data.totalRevenue) * 100}%`, background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', padding: '0 6px' }}>Cost</span>
              </div>
              <div style={{ flex: 1, background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', padding: '0 6px' }}>Margin</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Revenue', value: fmt(data.totalRevenue), color: '#007AFF' },
                { label: 'Cost of Goods', value: fmt(data.totalCostOfGoods), color: '#FF9500' },
                { label: 'Gross Margin', value: fmt(data.totalMargin), color: '#34C759' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#8E8E93' }}>{item.label}:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Big margin % circle */}
          <div style={{ textAlign: 'center', padding: '8px 24px', borderLeft: '1px solid rgba(60,60,67,0.08)' }}>
            <p style={{ fontSize: 40, fontWeight: 800, color: '#34C759', margin: 0, lineHeight: 1 }}>{data.marginPercent}%</p>
            <p style={{ fontSize: 11, color: '#8E8E93', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margin on Cost</p>
            <p style={{ fontSize: 11, color: '#8E8E93', margin: '2px 0 0' }}>{marginOfRevenue}% of Revenue</p>
          </div>
        </div>
      </SectionCard>

      {/* ── SALES & MARGIN TREND (per-day) ── */}
      {trendData.length > 0 && (
        <SectionCard title="Sales & Margin Trend" subtitle="Per day" fullWidth>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#007AFF" strokeWidth={2} fill="url(#gSales)" />
                <Area type="monotone" dataKey="margin" name="Margin" stroke="#34C759" strokeWidth={2} fill="url(#gMargin)" />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#AF52DE" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* ── PER-DAY MARGIN chart ── */}
      {trendData.length > 0 && (
        <SectionCard title="Per-Day Margin" subtitle="Gross margin by date" fullWidth>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) => [fmt(v), name]}
                  labelFormatter={(label: string, payload: any[]) => {
                    const d = payload?.[0]?.payload;
                    return d ? `${label} — ${d.marginPct >= 0 ? '+' : ''}${d.marginPct}% margin` : label;
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(60,60,67,0.2)" />
                <Bar dataKey="margin" name="Daily Margin" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.margin >= 0 ? '#34C759' : '#FF3B30'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Per-day margin % labels below chart */}
            <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              {trendData.map((d, idx) => (
                <div key={idx} style={{ textAlign: 'center', minWidth: 52 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: d.marginPct >= 0 ? '#34C759' : '#FF3B30',
                  }}>
                    {d.marginPct >= 0 ? '+' : ''}{d.marginPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── PRODUCT-WISE MARGIN ── */}
      <div className="col-2" style={{ display: 'grid', gap: 16 }}>
        {data.productMargins.length > 0 && (
          <SectionCard title="Product-wise Margin" subtitle="Revenue vs Cost vs Margin">
            <div style={{ padding: '16px 20px 20px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.productMargins} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8E8E93' }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, name: string) => [fmt(v), name]} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#007AFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="#FF9500" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="margin" name="Margin" fill="#34C759" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {/* Product-wise Margin % horizontal list */}
        {data.productMargins.length > 0 && (
          <SectionCard title="Product Margin %" subtitle="Margin on cost per product">
            <div style={{ padding: '8px 0' }}>
              {data.productMargins.map((p, idx) => {
                const maxPct = Math.max(...data.productMargins.map(x => Math.abs(x.marginPct)), 1);
                const barW = Math.min((Math.abs(p.marginPct) / maxPct) * 100, 100);
                return (
                  <div key={idx} style={{ padding: '10px 20px', borderBottom: idx < data.productMargins.length - 1 ? '1px solid rgba(60,60,67,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1E' }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#8E8E93' }}>{fmt(p.margin)}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: p.marginPct >= 0 ? '#34C759' : '#FF3B30',
                          minWidth: 44, textAlign: 'right',
                        }}>
                          {p.marginPct >= 0 ? '+' : ''}{p.marginPct}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'rgba(60,60,67,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${barW}%`,
                        background: p.marginPct >= 0 ? '#34C759' : '#FF3B30',
                        borderRadius: 3, transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Top customers + Recent sales + Low stock */}
      <div className="col-3" style={{ display: 'grid', gap: 16 }}>
        <SectionCard title="Top Customers by Outstanding">
          {data.topCustomers.length === 0 ? (
            <p style={{ padding: '24px 20px', color: '#8E8E93', fontSize: 14, margin: 0 }}>No outstanding balances</p>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {data.topCustomers.map((c, idx) => {
                const max = data.topCustomers[0]?.outstanding ?? 1;
                const pct = (c.outstanding / max) * 100;
                return (
                  <div key={idx} style={{ padding: '8px 20px', borderBottom: idx < data.topCustomers.length - 1 ? '1px solid rgba(60,60,67,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1E' }}>{c.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#FF3B30' }}>{fmt(c.outstanding)}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(60,60,67,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#FF3B30', borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Sales">
          {data.recentSales.length === 0 ? (
            <p style={{ padding: '24px 20px', color: '#8E8E93', fontSize: 14, margin: 0 }}>No sales yet</p>
          ) : (
            data.recentSales.map((sale, idx) => (
              <div key={sale.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 20px',
                borderBottom: idx < data.recentSales.length - 1 ? '1px solid rgba(60,60,67,0.06)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>{sale.customer?.name}</p>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: '1px 0 0' }}>
                    {new Date(sale.soldAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E' }}>{fmt(Number(sale.totalAmount))}</span>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard title="Low Stock Alert">
          {data.lowStockProducts.length === 0 ? (
            <p style={{ padding: '24px 20px', color: '#8E8E93', fontSize: 14, margin: 0 }}>All stock levels healthy</p>
          ) : (
            data.lowStockProducts.map((p, idx) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 20px',
                borderBottom: idx < data.lowStockProducts.length - 1 ? '1px solid rgba(60,60,67,0.06)' : 'none',
              }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>{p.name}</p>
                <span style={{
                  background: p.stock <= 0 ? 'rgba(255,59,48,0.1)' : 'rgba(255,149,0,0.1)',
                  color: p.stock <= 0 ? '#D70015' : '#C93400',
                  borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 500,
                }}>
                  {p.stock} {p.unit} left
                </span>
              </div>
            ))
          )}
        </SectionCard>
      </div>
    </div>
  );
}
