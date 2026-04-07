import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  Tag, LogOut, Menu, X, BookMarked, Bell, ChevronDown
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/borrowings', icon: ArrowLeftRight, label: 'Borrowings' },
  { to: '/categories', icon: Tag, label: 'Categories' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--accent-glow)'
          }}>
            <BookMarked size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1 }}>LibraryOS</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Management System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px 10px' }}>
          Navigation
        </div>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, background: 'var(--bg-3)',
          marginBottom: 8
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)', position: 'fixed',
        top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50,
      }} className="hide-mobile">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <aside style={{
            position: 'absolute', top: 0, left: 0, width: 260, height: '100%',
            background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
            overflowY: 'auto', zIndex: 70
          }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }} className="main-content-area">
        {/* Mobile topbar */}
        <div style={{
          display: 'none', padding: '12px 16px', background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 40,
        }} className="mobile-topbar">
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookMarked size={18} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>LibraryOS</span>
          </div>
        </div>

        <main style={{ padding: '32px', maxWidth: 1400 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .main-content-area { margin-left: 0 !important; }
          main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
