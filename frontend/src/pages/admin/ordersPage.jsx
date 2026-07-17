import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';

const STATUS_FLOW = {
  Pending: 'PREPARING',
  Preparing: 'READY',
  Ready: 'COMPLETED',
};

const OrdersPage = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-admin-room');

    const onNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      setNotice(`New order for Table ${order.tableNumber}`);
      setTimeout(() => setNotice(''), 4000);
    };

    const onOrderUpdated = (updated) => {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    };

    socket.on('new-order', onNewOrder);
    socket.on('order-updated', onOrderUpdated);
    return () => {
      socket.off('new-order', onNewOrder);
      socket.off('order-updated', onOrderUpdated);
    };
  }, [socket]);

  const activeOrders = useMemo(
    () => orders.filter((o) => !['Completed', 'Cancelled'].includes(o.orderStatus)),
    [orders]
  );

  const grouped = useMemo(() => {
    const map = {};
    for (const order of activeOrders) {
      const key = order.tableNumber;
      if (!map[key]) map[key] = [];
      map[key].push(order);
    }
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [activeOrders]);

  const advanceStatus = async (order) => {
    const next = STATUS_FLOW[order.orderStatus];
    if (!next) return;
    const { data } = await api.patch(`/api/orders/${order._id}/status`, { orderStatus: next });
    setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
  };

  const cancelOrder = async (order) => {
    const { data } = await api.patch(`/api/orders/${order._id}/status`, { orderStatus: 'CANCELLED' });
    setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
  };

  if (loading) return <p>Loading orders…</p>;

  return (
    <div>
      <h2>Live orders</h2>
      {notice && (
        <div className="ticket" style={{ borderLeft: '4px solid var(--gold)', marginBottom: '1rem' }}>
          🔔 {notice}
        </div>
      )}

      {grouped.length === 0 && <p>No active orders right now.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {grouped.map(([tableNumber, tableOrders]) => (
          <div key={tableNumber} className="ticket">
            <h3 style={{ marginBottom: '0.75rem' }}>Table {tableNumber}</h3>
            {tableOrders.map((order) => (
              <div key={order._id} style={{ borderTop: '1px dashed var(--line)', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="table-stamp">#{order._id.slice(-6).toUpperCase()}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <ul style={{ margin: '0.4rem 0', paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
                  {order.orderedItems.map((item) => (
                    <li key={item.menuItem}>{item.quantity}× {item.name}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Total</span>
                  <strong>${order.totalPrice.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {STATUS_FLOW[order.orderStatus] && (
                    <button className="btn btn-primary" onClick={() => advanceStatus(order)}>
                      Mark {STATUS_FLOW[order.orderStatus] === 'PREPARING' ? 'Preparing' : STATUS_FLOW[order.orderStatus] === 'READY' ? 'Ready' : 'Completed' }
                    </button>
                  )}
                  {order.orderStatus !== 'CANCELLED' && (
                    <button className="btn btn-danger" onClick={() => cancelOrder(order)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;