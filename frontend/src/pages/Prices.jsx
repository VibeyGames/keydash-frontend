import { useState, useEffect } from 'react';
import { getOffers, updatePrice } from '../services/api.js';
import { Save, RefreshCw, Check } from 'lucide-react';

function getCommissionRate(offer) {
  const price = offer.price?.amount;
  const iwtr = offer.priceIWTR?.amount;
  if (!price || !iwtr || price === 0) return null;
  return iwtr / price;
}

export default function Prices() {
  const [offers, setOffers] = useState([]);
  const [prices, setPrices] = useState({});
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getOffers();
      const data = Array.isArray(res.data) ? res.data : [];
      setOffers(data);
      const initial = {};
      const ratesMap = {};
      data.forEach(o => {
        initial[o.id] = o.price?.amount ? (o.price.amount / 100).toFixed(2) : '';
        const rate = getCommissionRate(o);
        if (rate) ratesMap[o.id] = rate;
      });
      setPrices(initial);
      setRates(ratesMap);
    } catch {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  function getLiveIWTR(offerId, buyerPrice) {
    const rate = rates[offerId];
    if (!rate || !buyerPrice || isNaN(buyerPrice)) return null;
    return (parseFloat(buyerPrice) * rate).toFixed(2);
  }

  async function handleSave(offerId) {
    const price = parseFloat(prices[offerId]);
    if (!price || price <= 0) return alert('Enter a valid price');
    setSaving(s => ({ ...s, [offerId]: true }));
    try {
      await updatePrice(offerId, price);
      setSaved(s => ({ ...s, [offerId]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [offerId]: false })), 2000);
      await load();
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
          Type a price to preview your IWTR — click Update only when ready
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
                <th>Current price</th>
                <th>New buyer price (€)</th>
                <th>You'll receive (IWTR)</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => {
                const liveIWTR = getLiveIWTR(offer.id, prices[offer.id]);
                const currentPrice = offer.price?.amount ? (offer.price.amount / 100).toFixed(2) : null;
                const newPrice = parseFloat(prices[offer.id]);
                const priceChanged = currentPrice && newPrice && newPrice !== parseFloat(currentPrice);

                return (
                  <tr key={offer.id}>
                    <td style={{ fontWeight: 500 }}>{offer.name || offer.productId}</td>
                    <td style={{ color: 'var(--text2)' }}>
                      €{currentPrice || '—'}
                    </td>
                    <td>
                      <input
                        type="number" step="0.01" min="0.01"
                        value={prices[offer.id] || ''}
                        onChange={e => setPrices(p => ({ ...p, [offer.id]: e.target.value }))}
                        style={{
                          width: 100,
                          borderColor: priceChanged ? 'var(--warning)' : undefined
                        }}
                      />
                    </td>
                    <td>
                      <span style={{
                        color: liveIWTR ? 'var(--success)' : 'var(--text3)',
                        fontWeight: liveIWTR ? 600 : 400,
                        fontSize: 15
                      }}>
                        {liveIWTR ? `€${liveIWTR}` : '—'}
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
                        className={`btn ${saved[offer.id] ? 'btn-secondary' : priceChanged ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => handleSave(offer.id)}
                        disabled={saving[offer.id] || !priceChanged}
                      >
                        {saving[offer.id] ? <RefreshCw size={12} /> :
                         saved[offer.id] ? <Check size={12} /> :
                         <Save size={12} />}
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
        * Kinguin allows 3 free price changes per offer per day. IWTR preview uses your product's actual commission rate.
      </div>
    </div>
  );
}
