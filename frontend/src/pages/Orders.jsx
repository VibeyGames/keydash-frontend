import { useState, useEffect } from 'react';
import { getOrders } from '../services/api.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders().then(res => {
      setOrders(res.data?.results || []);
    }).catch(() => setError('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)' }}>Loading orders...</div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Orders</h1>
        <p style={{ color: 'var(--text2)', marginTop: 2 }}>{orders.length} orders from Kinguin</p>
      </div>

      {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No orders yet</div>
        ) : (
          <table>
            <thead>
              <tr><th>Order ID</th><th>Product</th><th>Price</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>
                    #{order.id?.slice(0, 12)}
                  </td>
                  <td>{order.productName || order.kpcProductId || '—'}</td>
                  <td>€{order.price?.amount ? (order.price.amount / 100).toFixed(2) : '—'}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'DELIVERED' ? 'badge-success' :
                      order.status === 'PENDING' ? 'badge-warning' : 'badge-accent'
                    }`}>{order.status || '—'}</span>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
