import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  BookOpen, Users, ArrowLeftRight, AlertTriangle,
  TrendingUp, DollarSign, BookMarked, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-value">{value ?? <span className="skeleton" style={{ width: 60, height: 28, display: 'block' }} />}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change" style={{ color }}>{sub}</div>}
    </div>
  </div>
);

const COLORS = ['#7c6af7', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color || 'var(--accent)' }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Welcome back! Here's what's happening in your library today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ gap: 16, marginBottom: 32 }}>
        <StatCard icon={BookOpen} label="Total Books" value={s?.total_books?.toLocaleString()} color="var(--accent)" sub="In catalog" />
        <StatCard icon={Users} label="Members" value={s?.total_members?.toLocaleString()} color="var(--cyan)" sub="Active members" />
        <StatCard icon={ArrowLeftRight} label="Active Loans" value={s?.active_borrows?.toLocaleString()} color="var(--green)" sub="Currently issued" />
        <StatCard icon={AlertTriangle} label="Overdue" value={s?.overdue?.toLocaleString()} color="var(--red)" sub="Need attention" />
      </div>

      {/* Charts Row */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bar Chart */}
        <div className="card">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18 }}>Monthly Borrowings</h3>
            <span className="badge badge-purple">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(data?.monthlyBorrows || []).map(m => ({
                month: m.month,
                count: m.count || m.total || 0
              }))}
            >
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,106,247,0.05)' }} />
              <Bar dataKey="count" name="Borrowings" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18 }}>By Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data?.categoryStats?.slice(0, 6) || []}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                dataKey="count" nameKey="name"
                paddingAngle={3}
              >
                {(data?.categoryStats || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Borrowings */}
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--accent)" /> Recent Borrowings
          </h3>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '70%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '50%', height: 12 }} />
                </div>
              </div>
            ))
          ) : data?.recentBorrowings?.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <ArrowLeftRight size={32} /><p>No recent borrowings</p>
            </div>
          ) : (
            data?.recentBorrowings?.map(b => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'var(--accent-glow)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <BookOpen size={16} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{b.member_name}</div>
                </div>
                <span className={`badge ${b.status === 'returned' ? 'badge-green' : b.status === 'overdue' ? 'badge-red' : 'badge-blue'}`}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Popular Books */}
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--green)" /> Most Borrowed
          </h3>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '40%', height: 12 }} />
                </div>
              </div>
            ))
          ) : data?.popularBooks?.map((b, i) => (
            <div key={b.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: i === 0 ? 'var(--amber-bg)' : 'var(--bg-3)',
                color: i === 0 ? 'var(--amber)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0
              }}>#{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{b.author}</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{b.borrow_count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-2" style={{ gap: 16, marginTop: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ background: 'var(--amber-bg)' }}>
            <DollarSign size={22} color="var(--amber)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              ₹{Number(s?.total_fines || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Pending Fines</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ background: 'var(--green-bg)' }}>
            <BookMarked size={22} color="var(--green)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {s?.available_books?.toLocaleString() ?? '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Available Copies</div>
          </div>
        </div>
      </div>
    </div>
  );
}
