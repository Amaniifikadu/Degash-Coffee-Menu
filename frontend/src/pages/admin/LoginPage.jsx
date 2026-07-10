import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cafe.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
      }}
    >
      <form onSubmit={handleSubmit} className="ticket" style={{ width: 340 }}>
        <h2>Staff sign in</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginTop: 0 }}>
          Cafe dashboard access
        </p>

        <label style={{ display: 'block', margin: '0.75rem 0 0.3rem', fontSize: '0.85rem' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%' }}
        />

        <label style={{ display: 'block', margin: '0.75rem 0 0.3rem', fontSize: '0.85rem' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ width: '100%' }}
        />

        {error && <p style={{ color: 'var(--rust)', fontSize: '0.85rem' }}>{error}</p>}

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;