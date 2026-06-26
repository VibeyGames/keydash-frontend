import { useState, useEffect } from 'react';
import { getOffers, addKeys } from '../services/api.js';
import { Plus, Key } from 'lucide-react';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingKeys, setAddingKeys] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOffers().then(res => {
      setOffers(res.data?.results || []);
    }).catch(() => setError('Failed to load listings')).finally(() => setLoading(false));
  }, []);

  async function handleAddKeys(offerId) {
    const keys = keyInput.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keys.length) return;
    setSaving(true);
    try {
      await addKeys(offerId, keys);
      setAddingKeys(null);
      setKeyInput('');
      const res = await getOffers();
      setOffers(res.data?.results || []);
    } catch {
      alert('Failed to add keys. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)' }}>Loading listings...</div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>My listings</h1>
          <p style={{ color: 'var(--text2)', marginTop: 2 }}>{offers.length} active listings on Kinguin</p>
        </div>
      </div>

      {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {offers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <Package size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No listings yet on Kinguin</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <>
                  <tr key={offer.id}>
                    <td style={{ fontWeight: 500 }}>{offer.name || offer.kpcProductId}</td>
                    <td>€{offer.price?.amount ? (offer.price.amount / 100).toFixed(2) : '—'}</td>
                    <td>
                      <span style={{ color: offer.qty === 0 ? 'var(--danger)' : offer.qty <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                        {offer.qty ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${offer.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {offer.status || 'unknown'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => setAddingKeys(addingKeys === offer.id ? null : offer.id)}>
                        <Key size={12} /> Add keys
                      </button>
                    </td>
                  </tr>
                  {addingKeys === offer.id && (
                    <tr key={`${offer.id}-keys`}>
                      <td colSpan={5} style={{ background: 'var(--surface2)', padding: '16px' }}>
                        <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>
                          Paste your keys below — one key per line
                        </p>
                        <textarea
                          value={keyInput}
                          onChange={e => setKeyInput(e.target.value)}
                          rows={5}
                          style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                          placeholder={"XXXXX-XXXXX-XXXXX\nXXXXX-XXXXX-XXXXX"}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn btn-primary" onClick={() => handleAddKeys(offer.id)} disabled={saving}>
                            {saving ? 'Adding...' : `Add ${keyInput.split('\n').filter(k => k.trim()).length} keys`}
                          </button>
                          <button className="btn btn-secondary" onClick={() => { setAddingKeys(null); setKeyInput(''); }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
