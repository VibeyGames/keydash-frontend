import { useState, useEffect, useRef } from 'react';
import { getOffers, updatePrice, calculatePrice } from '../services/api.js';
import { Save, RefreshCw, Check, Loader } from 'lucide-react';

export default function Prices() {
  const [offers, setOffers] = useState([]);
  const [prices, setPrices] = useState({});
  const [iwtr, setIwtr] = useState({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState('');
  const timers = useRef({});

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getOffers();
      const data = Array.isArray(res.data) ? res.data : [];
      setOffers(data);
      const initial = {};
      const iwtrInit = {};
      data.forEach(o => {
        initial[o.id] = o.price?.amount ? (o.price.amount / 100).toFixed(2) : '';
        iwtrInit[o.id] = o.priceIWTR?.amount ? (o.priceIWTR.amount / 100).toFixed(2) : null;
      });
      setPrices(initial);
      setIwtr(iwtrInit);
    } catch {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  function handlePriceChange(offer, value) {
    setPrices(p => ({ ...p, [offer.id]: value }));

    if (timers.current[offer.id]) clearTimeout(timers.current[offer.id]);

    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      setIwtr(i => ({ ...i, [offer.id]: null }));
      return;
    }

    setCalculating(c => ({ ...c, [offer.id]: true }));

    timers.current[offer.id] = setTimeout(async () => {
      try {
        const res = await calculatePrice(offer.id, offer.productId, parseFloat(value));
        const iwtrAmount = res.data?.priceIWTR?.amount;
        setIwtr(i => ({ ...i, [offer.id]: iwtrAmount ? (iwtrAmount / 100).toFixed(2) : null }));
      } catch {
        setIwtr(i => ({ ...i, [offer.id]: null }));
      } finally {
        setCalculating(c => ({ ...c, [offer.id]: false }));
      }
    }, 600);
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
          Type a buyer price → real IWTR from Kinguin appears instantly → click Update when ready
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
                const currentPrice = offer.price?.amount ? (offer.price.amount / 100).toFixed(2) : null;
                const newPrice = parseFloat(prices[offer.id]);
                const priceChanged = currentPrice && newPrice && newPrice !== parseFloat(currentPrice);

                return (
                  <tr key={offer.id}>
                    <td style={{ fontWeight: 500 }}>{offer.name || offer.productId}</td>
                    <td style={{ color: 'var(--text2)' }}>€{currentPrice || '—'}</td>
                    <td>
                      <input
                        type="number" step="0.01" min="0.01"
                        value={prices[offer.id] || ''}
                        onChange={e => handlePriceChange(offer, e.target.value)}
                        style={{
                          width: 100,
                          borderColor: priceChanged ? 'var(--warning)' : undefined
                        }}
                      />
                    </td>
                    <td>
                      {calculating[offer.id] ? (
                        <Loader size={14} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <span style={{
                          color: iwtr[offer.id] ? 'var(--success)' : 'var(--text3)',
                          fontWeight: iwtr[offer.id] ? 600 : 400,
                          fontSize: 15
                        }}>
                          {iwtr[offer.id] ? `€${iwtr[offer.id]}` : '—'}
                        </span>
                      )}
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
        * IWTR fetched directly from Kinguin's API — 100% accurate per product commission
      </div>
    </div>
  );
}
