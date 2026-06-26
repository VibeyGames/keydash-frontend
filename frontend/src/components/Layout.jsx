import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tag, LogOut, Zap } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('keydash_token');
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 220, minWidth: 220, background: 'var(--surface)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', padding: '0'
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>KeyDash</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Stock hub</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
            { to: '/offers', icon: Package, label: 'My listings' },
            { to: '/prices', icon: Tag, label: 'Price control' },
            { to: '/orders', icon: ShoppingCart, label: 'Orders' },
          ].map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 'var(--radius)',
              marginBottom: 2, color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              fontWeight: isActive ? 500 : 400, transition: 'all 0.1s'
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
