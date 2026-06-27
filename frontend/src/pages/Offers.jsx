import { useState, useEffect } from 'react';
import { getOffers, addKeys } from '../services/api.js';
import { Key, Package, ExternalLink } from 'lucide-react';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingKeys, setAddingKeys] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getOffers();
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddKeys(offerId) {
    const keys = keyInput.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keys.length) return;
    setSaving(true);
    try {
      for (const key of keys) {
        await addKeys(offerId, key);
      }
      setAddingKeys(null);
      setKeyInput('');
      load();
    } catch {
      alert('Failed to add keys. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)' }}>Loading listings...</div>;

  const rows = [];
  offers.forEach(offer => {
    rows.push(
      <tr key={offer.id}>
        <td style={{ fontWeight: 500 }}>{offer.name || offer.productId}</td>
        <td>€{offer.priceIWTR?.amount ? (offer.priceIWTR.amount / 100).toFixed(2) : offer.price?.amount ? (offer.price.amount / 100).toFixed(2) : '—'}</td>
        <td style={{ color: offer.availableStock === 0 ? 'var(--danger)' : offer.availableStock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
          {offer.availableStock ?? '—'}
        </td>
        <td>
          <span className={`badge ${offer.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
            {offer.status || 'unknown'}
          </span>
        </td>
        <td style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={() => setAddingKeys(addingKeys === offer.id ? null : offer.id)}>
            <Key size={12} /> Add keys
          </button>
          
            href={`https://www.kinguin.net/search?q=${encodeURIComponent((offer.name || offer.productId).replace(/ > /g, ' '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ExternalLink size={12} /> View on Kinguin
          </a>
        </td>
      </tr>
    );
    if (addingKeys === offer.id) {
      rows.push(
        <tr key={`${offer.id}-keys`}>
          <td colSpan={5} style={{ background: 'var(--surface2)', padding: 16 }}>
            <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>Paste your keys — one per line</p>
            <textarea value={keyInput} onChange={e => setKeyInput(e.target.value)}
              rows={5} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
              placeholder={"XXXXX-XXXXX-XXXXX\nXXXXX-XXXXX-XXXXX"} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary" onClick={() => handleAddKeys(offer.id)} disabled={saving}>
                {saving ? 'Adding...' : `Add ${keyInput.split('\n').filter(k => k.trim()).length} keys`}
              </button>
              <button className="btn btn-secondary" onClick={() => { setAddingKeys(null); setKeyInput(''); }}>Cancel</button>
            </div>
          </td>
        </tr>
      );
    }
  });

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>My listings</h1>
        <p style={{ color: 'var(--text2)', marginTop: 2 }}>{offers.length} listings on Kinguin</p>
      </div>

      {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {offers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
            <Package size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No listings found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}