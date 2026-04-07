import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Tag, Edit2, Trash2, X, BookOpen } from 'lucide-react';

const ICONS = ['book', 'flask', 'scroll', 'cpu', 'brain', 'calculator', 'feather', 'briefcase', 'globe', 'music', 'heart', 'star'];
const COLORS = ['#7c6af7','#06b6d4','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899','#14b8a6','#f97316','#3b82f6','#84cc16','#a855f7'];

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState(category || { name: '', description: '', color: '#7c6af7', icon: 'book' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (category?.id) await api.put(`/categories/${category.id}`, form);
      else await api.post('/categories', form);
      toast.success(category ? 'Category updated!' : 'Category created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <Tag size={20} color="var(--amber)" />
          {category ? 'Edit Category' : 'New Category'}
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-wrap">
            <label className="input-label">Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Category name" />
          </div>
          <div className="input-wrap">
            <label className="input-label">Description</label>
            <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description" rows={2} />
          </div>
          <div className="input-wrap">
            <label className="input-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, background: c, border: 'none',
                    cursor: 'pointer', outline: form.color === c ? `3px solid white` : '3px solid transparent',
                    outlineOffset: 1, transition: 'all 0.15s'
                  }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: `${form.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Tag size={18} color={form.color} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: form.color }}>{form.name || 'Category Name'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Preview</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (category ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/categories'); setCategories(data.categories); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async cat => {
    if (!confirm(`Delete "${cat.name}"? Books in this category won't be deleted.`)) return;
    try { await api.delete(`/categories/${cat.id}`); toast.success('Deleted'); fetchCategories(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, marginBottom: 4 }}>Categories</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{categories.length} book categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> New Category</button>
      </div>

      {loading ? (
        <div className="grid grid-4" style={{ gap: 16 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card" style={{ height: 140 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: '50%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state"><Tag size={48} /><h3>No categories</h3><p>Create your first category</p></div>
      ) : (
        <div className="grid grid-4" style={{ gap: 16 }}>
          {categories.map(cat => (
            <div key={cat.id} className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: cat.color }} />
              <div style={{ paddingLeft: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: `${cat.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Tag size={20} color={cat.color} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(cat)}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(cat)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: cat.color }}>{cat.name}</div>
                {cat.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.description}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <BookOpen size={13} color="var(--text-3)" />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    <strong style={{ color: 'var(--text-2)' }}>{cat.book_count || 0}</strong> books
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'add' && <CategoryModal onClose={() => setModal(null)} onSave={() => { setModal(null); fetchCategories(); }} />}
      {modal && modal !== 'add' && <CategoryModal category={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchCategories(); }} />}
    </div>
  );
}
