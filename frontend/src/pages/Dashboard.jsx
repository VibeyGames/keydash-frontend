import { useState, useEffect } from 'react';
import { getStats, getOrders } from '../services/api.js';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  async function load() {
    try {
      setError('');
      const [statsRes, ordersRes] = await Promise.all([getStats(), getOrders()]);
      setStats(statsRes.data);
      setOrders(ordersRes.data?.results || []);
    } catch (err) {
      setError('Failed to load data from Kinguin. Check your API credentials.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function refresh() { setSyncing(true); load(); }

  if (loading) return (
    <div style={{ padding: 32, color: 'var(--text2)' }}>Loading your Kinguin data...</div>
  );

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h1>
          <p style={{ color: 'var(--text2)', marginTop: 2 }}>Live data from Kinguin</p>
        </div>
        <button onClick={refresh} className="btn btn-secondary" disabled={syncing}>
          <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
          {syncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)', color: 'var(--danger)',
          padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20
        }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Keys in stock', value: stats?.totalKeys ?? '—', icon: Package, color: 'var(--accent)' },
          { label: 'Active listings', value: stats?.activeListings ?? '—', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Low stock', value: stats?.lowStock?.length ?? '—', icon: AlertTriangle, color: 'var(--warning)' },
          { label: 'Out of stock', value: stats?.emptyStock?.length ?? '—', icon: ShoppingCart, color: 'var(--danger)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color }}>{value}</div>
          </div>
        ))}
      </div>

      {stats?.lowStock?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: 'var(--warning)' }}>
            ⚠️ Stock alerts
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead><tr><th>Product</th><th>Stock left</th><th>Status</th></tr></thead>
              <tbody>
                {stats.lowStock.map(offer => (
                  <tr key={offer.id}>
                    <td>{offer.name || offer.kpcProductId}</td>
                    <td>{offer.qty}</td>
                    <td><span className="badge badge-warning">Low stock</span></td>
                  </tr>
                ))}
                {stats.emptyStock?.map(offer => (
                  <tr key={offer.id}>
                    <td>{offer.name || offer.kpcProductId}</td>
                    <td>0</td>
                    <td><span className="badge badge-danger">Out of stock</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Recent orders</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {orders.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text2)', textAlign: 'center' }}>No orders yet</div>
          ) : (
            <table>
              <thead><tr><th>Order ID</th><th>Product</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id}>
                    <td style={{ color: 'var(--text2)', fontFamily: 'monospace', fontSize: 12 }}>#{order.id?.slice(0, 8)}</td>
                    <td>{order.productName || '—'}</td>
                    <td>€{order.price?.amount ? (order.price.amount / 100).toFixed(2) : '—'}</td>
                    <td><span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
