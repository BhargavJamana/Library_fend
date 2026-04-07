import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Plus, Search, BookOpen, Edit2, Trash2, X, Filter,
  ChevronLeft, ChevronRight, Eye, Package
} from 'lucide-react';

const LANGS = ['English','Hindi','Telugu','Tamil','Kannada','Malayalam','Bengali','Marathi','French','Spanish','German','Japanese','Chinese'];

function BookModal({ book, categories, onClose, onSave }) {
  const [form, setForm] = useState(book || {
    title:'', author:'', isbn:'', category_id:'', publisher:'',
    published_year:'', edition:'', description:'', total_copies:1,
    location:'', language:'English', pages:'', price:''
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (book?.id) await api.put(`/books/${book.id}`, form);
      else await api.post('/books', form);
      toast.success(book ? 'Book updated!' : 'Book added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-title">
          <BookOpen size={20} color="var(--accent)" />
          {book ? 'Edit Book' : 'Add New Book'}
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-2" style={{ gap: 14 }}>
            <div className="input-wrap" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Book title" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Author *</label>
              <input className="input" value={form.author} onChange={e => set('author', e.target.value)} required placeholder="Author name" />
            </div>
            <div className="input-wrap">
              <label className="input-label">ISBN</label>
              <input className="input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-..." />
            </div>
            <div className="input-wrap">
              <label className="input-label">Category</label>
              <select className="input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label">Publisher</label>
              <input className="input" value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="Publisher name" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Published Year</label>
              <input className="input" type="number" value={form.published_year} onChange={e => set('published_year', e.target.value)} placeholder="2024" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Edition</label>
              <input className="input" value={form.edition} onChange={e => set('edition', e.target.value)} placeholder="1st Edition" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Total Copies</label>
              <input className="input" type="number" min="1" value={form.total_copies} onChange={e => set('total_copies', e.target.value)} />
            </div>
            <div className="input-wrap">
              <label className="input-label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="A-01-01" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Language</label>
              <select className="input" value={form.language} onChange={e => set('language', e.target.value)}>
                {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label">Pages</label>
              <input className="input" type="number" value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="300" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Price (₹)</label>
              <input className="input" type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="299.00" />
            </div>
            <div className="input-wrap" style={{ gridColumn: '1/-1' }}>
              <label className="input-label">Description</label>
              <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Book description..." rows={3} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (book ? 'Save Changes' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookCard({ book, onEdit, onDelete }) {
  const avail = book.available_copies > 0;
  return (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Category color stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: book.category_color || 'var(--accent)'
      }} />
      {/* Book cover placeholder */}
      <div style={{
        width: '100%', height: 120, borderRadius: 8, marginBottom: 14,
        background: `linear-gradient(135deg, ${book.category_color || 'var(--accent)'}30, ${book.category_color || 'var(--accent)'}10)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8
      }}>
        <BookOpen size={36} color={book.category_color || 'var(--accent)'} style={{ opacity: 0.7 }} />
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {book.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10 }}>{book.author}</div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {book.category_name && (
          <span className="badge" style={{ background: `${book.category_color}20`, color: book.category_color, fontSize: 11 }}>
            {book.category_name}
          </span>
        )}
        <span className={`badge ${avail ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11 }}>
          {avail ? `${book.available_copies} avail.` : 'Unavailable'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
          <Package size={12} style={{ display: 'inline', marginRight: 4 }} />
          {book.total_copies} copies
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(book)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(book)} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(null); // null | 'add' | {book}
  const [view, setView] = useState('grid');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search, category: catFilter, available: availFilter };
      const { data } = await api.get('/books', { params });
      setBooks(data.books); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [page, search, catFilter, availFilter]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };

  const handleDelete = async book => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      toast.success('Book deleted');
      fetchBooks();
    } catch { toast.error('Failed to delete'); }
  };

  const closeModal = () => setModal(null);
  const onSave = () => { closeModal(); fetchBooks(); };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 4 }}>Books</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{total} books in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Book
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input className="input" placeholder="Search by title, author, ISBN..." value={search} onChange={handleSearch} style={{ paddingLeft: 40 }} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 160 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={availFilter} onChange={e => { setAvailFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="true">Available</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-4" style={{ gap: 16 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card" style={{ height: 280 }}>
              <div className="skeleton" style={{ height: 120, borderRadius: 8, marginBottom: 14 }} />
              <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 13, width: '60%' }} />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-4" style={{ gap: 16 }}>
          {books.map(book => (
            <BookCard key={book.id} book={book} onEdit={b => setModal(b)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            {[...Array(Math.min(pages, 7))].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === pages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && <BookModal categories={categories} onClose={closeModal} onSave={onSave} />}
      {modal && modal !== 'add' && <BookModal book={modal} categories={categories} onClose={closeModal} onSave={onSave} />}
    </div>
  );
}
