import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';

const STEPS = ['Pending', 'Preparing', 'Ready'];

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError('Order not found. Double check the link, or ask staff for help.');
      }
    };
    load();
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-order-room', orderId);
    const handler = (updated) => {
      if (updated._id === orderId) setOrder(updated);
    };
    socket.on('order-updated', handler);
    return () => socket.off('order-updated', handler);
  }, [socket, orderId]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <p style={{ color: 'var(--rust)' }}>{error}</p>
        <Link to="/menu">Back to menu</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <p>Loading your order…</p>
      </div>
    );
  }

  const activeStepIndex = STEPS.indexOf(order.orderStatus);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem', maxWidth: 520 }}>
      <h1>Order tracking</h1>
      <span className="table-stamp">Table {order.tableNumber} · Order #{order._id.slice(-6).toUpperCase()}</span>

      <div className="ticket" style={{ marginTop: '1.25rem' }}>
        <StatusBadge status={order.orderStatus} />

        {/* Simple progress steps for the common happy-path statuses */}
        {activeStepIndex >= 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            {STEPS.map((step, idx) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 4,
                  background: idx <= activeStepIndex ? 'var(--teal)' : 'var(--paper-dim)',
                }}
              />
            ))}
          </div>
        )}

        <h3 style={{ marginTop: '1rem' }}>Items</h3>
        {order.orderedItems.map((item) => (
          <div key={item.menuItem} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>{item.quantity}× {item.name}</span>
            <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 600 }}>
          <span>Total</span>
          <span>{order.totalPrice.toFixed(2)} ETB</span>
        </div>
      </div>

      <Link to={`/menu?table=${order.tableNumber}`} style={{ display: 'inline-block', marginTop: '1rem' }}>
        ← Order something else
      </Link>
    </div>
  );
};

export default OrderTrackingPage;