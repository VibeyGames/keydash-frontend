import { useState, useEffect } from 'react';
import { getOffers, updatePrice } from '../services/api.js';
import { Save, RefreshCw } from 'lucide-react';

export default function Prices() {
  const [offers, setOffers] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    getOffers().then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setOffers(data);
      const initial = {};
      data.forEach(o => {
        initial[o.id] = o.priceIWTR?.amount ? (o.priceIWTR.amount / 100).toFixed(2) : o.price?.amount ? (o.price.amount / 100).toFixed(2) : '';
      });
      setPrices(initial);
    }).catch(() => setError('Failed to load listings')).finally(() => setLoading(false));
  }, []);

  async function handleSave(offerId) {
    const price = parseFloat(prices[offerId]);
    if (!price || price <= 0) return alert('Enter a valid price');
    setSaving(s => ({ ...s, [offerId]: true }));
    try {
      await updatePrice(offerId, price);
      setSaved(s => ({ ...s, [offerId]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [offerId]: false })), 2000);
    } catch {
      alert('Failed to update price. Please try again.');
    } finally {
      setSaving(s => ({ ...s, [offerId]: false }));
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)' }}>Loading prices...</div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Price control</h1>
        <p style={{ color: 'var(--text2)', marginTop: 2 }}>Update prices — changes go live on Kinguin instantly</p>
      </div>

      {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {offers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No listings found</div>
        ) : (
          <table>
            <thead>
              <tr><th>Product</th><th>Current price (IWTR)</th><th>New price (€)</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer.id}>
                  <td style={{ fontWeight: 500 }}>{offer.name || offer.productId}</td>
                  <td style={{ color: 'var(--text2)' }}>
                    €{offer.priceIWTR?.amount ? (offer.priceIWTR.amount / 100).toFixed(2) : '—'}
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0.01"
                      value={prices[offer.id] || ''}
                      onChange={e => setPrices(p => ({ ...p, [offer.id]: e.target.value }))}
                      style={{ width: 100 }} />
                  </td>
                  <td style={{ color: offer.availableStock === 0 ? 'var(--danger)' : offer.availableStock <= 5 ? 'var(--warning)' : 'var(--text2)' }}>
                    {offer.availableStock ?? '—'} keys
                  </td>
                  <td>
                    <button className={`btn ${saved[offer.id] ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => handleSave(offer.id)} disabled={saving[offer.id]}>
                      {saving[offer.id] ? <RefreshCw size={12} /> : <Save size={12} />}
                      {saved[offer.id] ? 'Saved!' : saving[offer.id] ? 'Saving...' : 'Update'}
                    </button>
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
