import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { Zap } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem('keydash_token', res.data.token);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)'
    }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>KeyDash</h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>Sign in to your dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="abdallah" style={{ width: '100%' }} required
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" style={{ width: '100%' }} required
              />
            </div>
            {error && (
              <div style={{
                background: 'var(--danger-bg)', color: 'var(--danger)',
                padding: '10px 14px', borderRadius: 'var(--radius)',
                marginBottom: 16, fontSize: 13
              }}>{error}</div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
