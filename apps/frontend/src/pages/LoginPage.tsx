import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  'admin@fundsroom.local',
  'sales@fundsroom.local',
  'warehouse@fundsroom.local',
  'accounts@fundsroom.local'
];

export default function LoginPage() {
  const [email, setEmail] = useState(demoAccounts[0]);
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="eyebrow">Wholesale Operations Portal</div>
        <h1>Mini ERP + CRM for internal teams</h1>
        <p>Sign in to manage customers, stock, sales challans, and follow-ups in one place.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="hint-box">
          <strong>Demo credentials</strong>
          <ul>
            {demoAccounts.map((account) => (
              <li key={account}>{account} / Password123!</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}