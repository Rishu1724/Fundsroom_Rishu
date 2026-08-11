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
      <div className="login-panel login-grid">
        <section className="login-story">
          <div className="eyebrow">Indian wholesale operations</div>
          <h1>Control customers, challans, and stock from one clean workspace.</h1>
          <p>
            Built for distributors and internal teams that need fast follow-ups, accurate inventory,
            and a simple flow from lead to confirmed sale.
          </p>

          <div className="hero-pills">
            <span>GST-ready records</span>
            <span>Live Render data</span>
            <span>Stock-safe challans</span>
          </div>

          <div className="story-card">
            <div>
              <strong>Test roles</strong>
              <p>Admin, Sales, Warehouse, Accounts</p>
            </div>
            <div>
              <strong>Best for</strong>
              <p>Wholesale, trading, and distribution teams</p>
            </div>
          </div>
        </section>

        <section className="login-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-kicker">Sign in with your team account</div>
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
              {loading ? 'Signing in...' : 'Enter portal'}
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
        </section>
      </div>
    </div>
  );
}