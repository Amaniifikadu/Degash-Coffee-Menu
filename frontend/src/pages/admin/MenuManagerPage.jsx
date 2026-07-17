import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', description: '', price: '', imageUrl: '', category: '', isAvailable: true };

const MenuManagerPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [itemRes, catRes] = await Promise.all([api.get('/menu-items'), api.get('/categories')]);
    setItems(itemRes.data);
    setCategories(catRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await api.put(`/api/menu-items/${editingId}`, payload);
      } else {
        await api.post('/api/menu-items', payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save item');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || '',
      category: item.category?._id || '',
      isAvailable: item.isAvailable,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    await api.delete(`/api/menu-items/${id}`);
    load();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
      <form onSubmit={handleSubmit} className="ticket" style={{ height: 'fit-content' }}>
        <h3>{editingId ? 'Edit item' : 'Add menu item'}</h3>

        <label style={{ fontSize: '0.85rem' }}>Name</label>
        <input
          required
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label style={{ fontSize: '0.85rem' }}>Description</label>
        <textarea
          rows={2}
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label style={{ fontSize: '0.85rem' }}>Price ETB</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <label style={{ fontSize: '0.85rem' }}>Image URL</label>
        <input
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />

        <label style={{ fontSize: '0.85rem' }}>Category</label>
        <select
          required
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
          />
          Available on menu
        </label>

        {error && <p style={{ color: 'var(--rust)', fontSize: '0.85rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add item'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div>
        <h3>All menu items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((item) => (
            <div key={item._id} className="ticket" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.name}</strong> — {item.price.toFixed(2)} ETB
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  {item.category?.name || 'Uncategorized'} · {item.isAvailable ? 'Available' : 'Hidden'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline" onClick={() => handleEdit(item)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>No menu items yet — add your first one on the left.</p>}
        </div>
      </div>
    </div>
  );
};

export default MenuManagerPage;