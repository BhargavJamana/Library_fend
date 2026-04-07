import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookMarked, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@library.com', password: 'password' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Left panel - branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
        position: 'relative'
      }} className="hide-mobile">
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px var(--accent-glow)'
            }}>
              <BookMarked size={24} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>LibraryOS</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Management System</div>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, lineHeight: 1.15, marginBottom: 20 }}>
            Your Library,<br />
            <span style={{ color: 'var(--accent)' }}>Perfectly Managed</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            A powerful, elegant system to manage books, members, borrowings, and more — all in one place.
          </p>

          {/* Feature pills */}
          {['📚 10,000+ Books Catalog', '👥 Member Management', '🔄 Borrowing & Returns', '📊 Analytics Dashboard'].map(f => (
            <div key={f} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8, background: 'var(--bg-3)',
              border: '1px solid var(--border)', fontSize: 13, marginBottom: 8,
              marginRight: 8, color: 'var(--text-2)'
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 48px'
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} className="mobile-only">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookMarked size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>LibraryOS</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Sign in to your library dashboard</p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="input-wrap">
            <label className="input-label">Email Address</label>
            <div className="search-bar">
              <Mail size={16} />
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@library.com"
                required
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label">Password</label>
            <div className="search-bar">
              <Lock size={16} />
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                style={{ paddingLeft: 40, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, justifyContent: 'center', padding: '13px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" />
                Signing in...
              </span>
            ) : (
              <><span>Sign In</span><ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: 32, padding: 16, borderRadius: 12,
          background: 'var(--accent-glow)', border: '1px solid rgba(124,106,247,0.2)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>🔑 Demo Credentials</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <div><strong style={{ color: 'var(--text)' }}>Email:</strong> admin@library.com</div>
            <div><strong style={{ color: 'var(--text)' }}>Password:</strong> password</div>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
          div[style*="max-width: 480px"] { padding: 24px !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
