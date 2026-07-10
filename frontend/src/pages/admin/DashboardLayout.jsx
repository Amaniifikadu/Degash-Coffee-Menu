import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinkStyle = ({ isActive }) => ({
  padding: '0.5rem 0.9rem',
  borderRadius: 8,
  textDecoration: 'none',
  color: isActive ? 'var(--ink)' : 'var(--paper)',
  background: isActive ? 'var(--gold)' : 'transparent',
  fontWeight: 600,
  fontSize: '0.9rem',
});

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Cafe Dashboard</h1>
            <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>{user?.name} · {user?.role}</span>
          </div>
          <button className="btn btn-outline" style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
        <nav className="container" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <NavLink to="/admin/orders" style={navLinkStyle}>Live orders</NavLink>
          <NavLink to="/admin/menu-items" style={navLinkStyle}>Menu items</NavLink>
          <NavLink to="/admin/categories" style={navLinkStyle}>Categories</NavLink>
          <NavLink to="/admin/qr-generator" style={navLinkStyle}>QR generator</NavLink>
        </nav>
      </header>

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;