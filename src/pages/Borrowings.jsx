import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Search, ArrowLeftRight, CheckCircle, X, ChevronLeft, ChevronRight, Clock, AlertTriangle, BookOpen, User } from 'lucide-react';
import { format, addDays } from 'date-fns';

function IssueModal({ onClose, onSave }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ book_id: '', member_id: '', due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd') });
  const [saving, setSaving] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    api.get('/books', { params: { available: 'true', limit: 100, search: bookSearch } }).then(r => setBooks(r.data.books));
  }, [bookSearch]);

  useEffect(() => {
    api.get('/members', { params: { limit: 100, search: memberSearch } }).then(r => setMembers(r.data.members));
  }, [memberSearch]);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/borrowings', form);
      toast.success('Book issued successfully!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to issue'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <ArrowLeftRight size={20} color="var(--green)" />
          Issue Book
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrap">
            <label className="input-label">Search & Select Book *</label>
            <input className="input" placeholder="Type to search available books..." value={bookSearch}
              onChange={e => setBookSearch(e.target.value)} style={{ marginBottom: 8 }} />
            <select className="input" size={4} value={form.book_id} onChange={e => setForm(p => ({ ...p, book_id: e.target.value }))} required
              style={{ height: 'auto' }}>
              <option value="">-- Select a book --</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.available_copies} avail.)</option>
              ))}
            </select>
          </div>

          <div className="input-wrap">
            <label className="input-label">Search & Select Member *</label>
            <input className="input" placeholder="Type to search members..." value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)} style={{ marginBottom: 8 }} />
            <select className="input" size={4} value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))} required
              style={{ height: 'auto' }}>
              <option value="">-- Select a member --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.member_id}) — {m.active_borrows}/{m.max_books} books</option>
              ))}
            </select>
          </div>

          <div className="input-wrap">
            <label className="input-label">Due Date *</label>
            <input className="input" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Issuing...' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReturnConfirmModal({ borrowing, onClose, onConfirm }) {
  const today = new Date();
  const due = new Date(borrowing.due_date);
  const isLate = today > due;
  const days = isLate ? Math.ceil((today - due) / (1000 * 60 * 60 * 24)) : 0;
  const fine = days * 2;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <CheckCircle size={20} color="var(--green)" />
          Confirm Return
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{borrowing.book_title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{borrowing.book_author}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>MEMBER</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{borrowing.member_name}</div>
            </div>
            <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>DUE DATE</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: isLate ? 'var(--red)' : 'var(--text)' }}>
                {format(new Date(borrowing.due_date), 'dd MMM yyyy')}
              </div>
            </div>
          </div>

          {isLate && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--red)', fontWeight: 600 }}>
                <AlertTriangle size={16} /> Late Return Fine
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                {days} days late × ₹2/day = <strong style={{ color: 'var(--red)' }}>₹{fine.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {!isLate && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontWeight: 600 }}>
                <CheckCircle size={16} /> Returned on time — No fine!
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={onConfirm}>Confirm Return</button>
        </div>
      </div>
    </div>
  );
}

const statusColors = { active: 'badge-blue', returned: 'badge-green', overdue: 'badge-red', lost: 'badge-amber' };

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [issueModal, setIssueModal] = useState(false);
  const [returnModal, setReturnModal] = useState(null);

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/borrowings', { params: { page, limit: 12, status: statusFilter } });
      setBorrowings(data.borrowings); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBorrowings(); }, [fetchBorrowings]);

  const handleReturn = async () => {
    try {
      const { data } = await api.put(`/borrowings/${returnModal.id}/return`);
      toast.success(data.fine > 0 ? `Book returned. Fine: ₹${data.fine}` : 'Book returned successfully!');
      setReturnModal(null); fetchBorrowings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to return'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 4 }}>Borrowings</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIssueModal(true)}><Plus size={16} /> Issue Book</button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'active', 'returned', 'overdue'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className="btn btn-sm"
            style={{
              background: statusFilter === s ? 'var(--accent)' : 'var(--bg-3)',
              color: statusFilter === s ? 'white' : 'var(--text-2)',
              border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
            }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 180 : 90 }} /></td>
                    ))}
                  </tr>
                ))
              ) : borrowings.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state"><ArrowLeftRight size={40} /><h3>No records found</h3></div>
                </td></tr>
              ) : borrowings.map(b => {
                const isOverdue = b.status === 'active' && new Date(b.due_date) < new Date();
                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={14} color="var(--accent)" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book_title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.book_author}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{b.member_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.member_code}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{format(new Date(b.issue_date), 'dd MMM yy')}</td>
                    <td>
                      <span style={{ fontSize: 13, color: isOverdue ? 'var(--red)' : 'var(--text-2)' }}>
                        {isOverdue && <AlertTriangle size={12} style={{ marginRight: 4, display: 'inline' }} />}
                        {format(new Date(b.due_date), 'dd MMM yy')}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-3)' }}>
                      {b.return_date ? format(new Date(b.return_date), 'dd MMM yy') : '—'}
                    </td>
                    <td>
                      {Number(b.fine_amount) > 0
                        ? <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: 13 }}>₹{Number(b.fine_amount).toFixed(2)}</span>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${isOverdue ? 'badge-red' : statusColors[b.status]}`}>
                        {isOverdue ? 'overdue' : b.status}
                      </span>
                    </td>
                    <td>
                      {(b.status === 'active' || b.status === 'overdue') && (
                        <button className="btn btn-success btn-sm" onClick={() => setReturnModal(b)}>
                          <CheckCircle size={13} /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}><ChevronLeft size={16} /></button>
            {[...Array(Math.min(pages, 5))].map((_, i) => (
              <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === pages}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {issueModal && <IssueModal onClose={() => setIssueModal(false)} onSave={() => { setIssueModal(false); fetchBorrowings(); }} />}
      {returnModal && <ReturnConfirmModal borrowing={returnModal} onClose={() => setReturnModal(null)} onConfirm={handleReturn} />}
    </div>
  );
}
