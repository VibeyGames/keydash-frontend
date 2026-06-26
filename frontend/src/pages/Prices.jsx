import { useState, useEffect } from 'react';
import { getOffers, updatePrice } from '../services/api.js';
import { Save, RefreshCw } from 'lucide-react';

function calculateIWTR(buyerPrice) {
  if (!buyerPrice || isNaN(buyerPrice)) return null;
  const p = parseFloat(buyerPrice);
  const iwtr = (p - 0.15) / 1.1;
  return iwtr.toFixed(2);
}

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
        initial[o.id] = o.price?.amount ? (o.price.amount / 100).toFixed(2) : '';
      });
      setPrices(initial);
    }).catch(() => setError('Failed to load listings')).finally(() => setLoading(false));
  }, []);

  async function handleSave(offerId) {
    const buyerPrice = parseFloat(prices[offerId]);
    if (!buyerPrice || buyerPrice <= 0) return alert('Enter a valid price');
    const iwtr = parseFloat(calculateIWTR(buyerPrice));
    setSaving(s => ({ ...s, [offerId]: true }));
    try {
      await updatePrice(offerId, iwtr);
      setSaved(s => ({ ...s, [offerId]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [offerId]: false })), 2000);
    } catch {
      alert('Failed to update price.');
    } finally {
      setSaving(s => ({ ...s, [offerId]: false }));
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)' }}>Loading prices...</div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Price control</h1>
        <p style={{ color: 'var(--text2)', marginTop: 2 }}>
          Type the buyer price — see what you'll receive instantly
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {offers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No listings found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Buyer pays (€)</th>
                <th>You receive (IWTR)</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => {
                const iwtr = calculateIWTR(prices[offer.id]);
                return (
                  <tr key={offer.id}>
                    <td style={{ fontWeight: 500 }}>{offer.name || offer.productId}</td>
                    <td>
                      <input
                        type="number" step="0.01" min="0.01"
                        value={prices[offer.id] || ''}
                        onChange={e => setPrices(p => ({ ...p, [offer.id]: e.target.value }))}
                        style={{ width: 100 }}
                      />
                    </td>
                    <td>
                      <span style={{
                        color: iwtr ? 'var(--success)' : 'var(--text3)',
                        fontWeight: iwtr ? 600 : 400,
                        fontSize: 14
                      }}>
                        {iwtr ? `€${iwtr}` : '—'}
                      </span>
                    </td>
                    <td style={{
                      color: offer.availableStock === 0 ? 'var(--danger)' :
                        offer.availableStock <= 5 ? 'var(--warning)' : 'var(--text2)'
                    }}>
                      {offer.availableStock ?? '—'} keys
                    </td>
                    <td>
                      <button
                        className={`btn ${saved[offer.id] ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => handleSave(offer.id)}
                        disabled={saving[offer.id]}
                      >
                        {saving[offer.id] ? <RefreshCw size={12} /> : <Save size={12} />}
                        {saved[offer.id] ? 'Saved!' : saving[offer.id] ? 'Saving...' : 'Update'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
        * IWTR = (buyer price − €0.15) ÷ 1.10 — Kinguin commission estimate
      </div>
    </div>
  );
}
