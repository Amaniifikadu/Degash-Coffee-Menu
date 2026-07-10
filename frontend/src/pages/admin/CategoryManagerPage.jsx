import { useEffect, useState } from 'react';
import api from '../../api/axios';

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/categories', { name, image, displayOrder: categories.length + 1 });
      setName('');
      setImage('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Items using it must be reassigned first.')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
      <form onSubmit={handleSubmit} className="ticket" style={{ height: 'fit-content' }}>
        <h3>Add category</h3>
        <label style={{ fontSize: '0.85rem' }}>Name</label>
        <input
          required
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Beverages"
        />
        <label style={{ fontSize: '0.85rem' }}>Image URL (optional)</label>
        <input
          style={{ width: '100%', marginBottom: '0.6rem' }}
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        {error && <p style={{ color: 'var(--rust)', fontSize: '0.85rem' }}>{error}</p>}
        <button className="btn btn-primary" type="submit">Add category</button>
      </form>

      <div>
        <h3>Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {categories.map((cat) => (
            <div key={cat._id} className="ticket" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{cat.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>/{cat.slug}</div>
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
            </div>
          ))}
          {categories.length === 0 && <p>No categories yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerPage;