import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, totalCount } = useCart();

  // The table number is read directly from the URL: /menu?table=5
  const tableNumber = searchParams.get('table');

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catRes, itemRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/menu-items', { params: { available: true } }),
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
      } catch (err) {
        setError('Could not load the menu. Please refresh or ask staff for help.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((i) => i.category?._id === activeCategory);
  }, [items, activeCategory]);

  if (!tableNumber) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="ticket" style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2>No table detected</h2>
          <p>
            This menu link is missing a table number. Please scan the QR code on your
            table, or ask staff for the correct link (it should look like
            <code> /menu?table=5</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '1.4rem 0 1.1rem',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Menu</h1>
            <span className="table-stamp" style={{ color: 'var(--gold)' }}>
              Table {tableNumber}
            </span>
          </div>
          <button className="btn btn-gold" onClick={() => navigate(`/cart?table=${tableNumber}`)}>
            Cart {totalCount > 0 ? `(${totalCount})` : ''}
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        {error && <p style={{ color: 'var(--rust)' }}>{error}</p>}

        {/* Category filter chips */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
          <button
            className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`btn ${activeCategory === cat._id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading menu…</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            {filteredItems.map((item) => (
              <div key={item._id} className="ticket" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}
                <h3 style={{ fontSize: '1.05rem' }}>{item.name}</h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '0.9rem', flexGrow: 1 }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{item.price.toFixed(2)} ETB</strong>
                  <button className="btn btn-primary" onClick={() => addItem(item)}>
                    Add
                  </button>
                </div>
              </div>
            ))}
            {!loading && filteredItems.length === 0 && <p>No items in this category yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;