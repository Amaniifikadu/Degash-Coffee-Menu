import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get('table');
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async () => {
    if (!tableNumber) {
      setError('Missing table number. Please rescan the QR code on your table.');
      return;
    }
    if (items.length === 0) return;

    try {
      setPlacing(true);
      setError('');
      const payload = {
        tableNumber: Number(tableNumber),
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      };
      const { data: order } = await api.post('/api/orders', payload);
      clearCart();
      navigate(`/order/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem', maxWidth: 560 }}>
      <Link to={`/menu?table=${tableNumber || ''}`} style={{ fontSize: '0.9rem' }}>
        ← Back to menu
      </Link>
      <h1 style={{ marginTop: '0.75rem' }}>Your order</h1>
      <span className="table-stamp">Table {tableNumber || '—'}</span>

      {items.length === 0 ? (
        <p style={{ marginTop: '1.5rem' }}>Your cart is empty. Add something tasty from the menu.</p>
      ) : (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="ticket"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong>{item.name}</strong>
                <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                  {item.price.toFixed(2)} ETB each
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>
                  −
                </button>
                <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button className="btn btn-outline" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                  +
                </button>
                <button className="btn btn-danger" onClick={() => removeItem(item.menuItemId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            <strong>Total</strong>
            <strong>{totalPrice.toFixed(2)} ETB</strong>
          </div>

          {error && <p style={{ color: 'var(--rust)' }}>{error}</p>}

          <button className="btn btn-gold" style={{ marginTop: '0.5rem' }} disabled={placing} onClick={placeOrder}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;