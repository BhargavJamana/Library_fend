import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Search, Users, Edit2, Trash2, X, ChevronLeft, ChevronRight, User, Mail, Phone, Shield } from 'lucide-react';

const TYPES = ['basic', 'premium', 'student'];

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member || {
    name: '', email: '', phone: '', address: '',
    membership_type: 'basic', date_of_birth: ''
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (member?.id) await api.put(`/members/${member.id}`, form);
      else await api.post('/members', form);
      toast.success(member ? 'Member updated!' : 'Member added!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <User size={20} color="var(--cyan)" />
          {member ? 'Edit Member' : 'Add New Member'}
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-2" style={{ gap: 14 }}>
            <div className="input-wrap" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Member's full name" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="email@example.com" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-9876543210" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Membership Type</label>
              <select className="input" value={form.membership_type} onChange={e => set('membership_type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label">Date of Birth</label>
              <input className="input" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div className="input-wrap" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Address</label>
              <textarea className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" rows={2} />
            </div>
            {member && (
              <div className="input-wrap">
                <label className="input-label">Status</label>
                <select className="input" value={form.is_active} onChange={e => set('is_active', e.target.value === 'true')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (member ? 'Save Changes' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const memberTypeColors = { basic: 'badge-blue', premium: 'badge-purple', student: 'badge-green' };
const memberTypeBg = { basic: '#60a5fa', premium: '#7c6af7', student: '#34d399' };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/members', { params: { page, limit: 10, search, type: typeFilter } });
      setMembers(data.members); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async m => {
    if (!confirm(`Deactivate member "${m.name}"?`)) return;
    try { await api.delete(`/members/${m.id}`); toast.success('Member deactivated'); fetchMembers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 4 }}>Members</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{total} registered members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add Member</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input className="input" placeholder="Search by name, email, member ID..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 40 }} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 160 }} value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Member ID</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Active Loans</th>
                <th>Fine Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state"><Users size={40} /><h3>No members found</h3></div>
                </td></tr>
              ) : members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${memberTypeBg[m.membership_type]}20`,
                        color: memberTypeBg[m.membership_type],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14
                      }}>{m.name[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 12, background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 4 }}>{m.member_id}</code></td>
                  <td><span className={`badge ${memberTypeColors[m.membership_type]}`}>{m.membership_type}</span></td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {m.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{m.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: m.active_borrows > 0 ? 'var(--blue)' : 'var(--text-3)' }}>
                      {m.active_borrows || 0}
                    </span>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}> / {m.max_books}</span>
                  </td>
                  <td>
                    {Number(m.fine_balance) > 0
                      ? <span style={{ color: 'var(--red)', fontWeight: 600 }}>₹{Number(m.fine_balance).toFixed(2)}</span>
                      : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${m.is_active ? 'badge-green' : 'badge-red'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(m)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(m)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Page {page} of {pages}</div>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}><ChevronLeft size={16} /></button>
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === pages}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {modal === 'add' && <MemberModal onClose={() => setModal(null)} onSave={() => { setModal(null); fetchMembers(); }} />}
      {modal && modal !== 'add' && <MemberModal member={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchMembers(); }} />}
    </div>
  );
}
