import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts: { email: string; label: string; icon: string }[] = [
  { email: 'admin@fundsroom.local', label: 'Admin', icon: '🛡️' },
  { email: 'sales@fundsroom.local', label: 'Sales', icon: '💼' },
  { email: 'warehouse@fundsroom.local', label: 'Warehouse', icon: '📦' },
  { email: 'accounts@fundsroom.local', label: 'Accounts', icon: '💰' }
];

const features = [
  { icon: '🧾', title: 'GST-ready records', desc: 'Clean ledgers and challan trails' },
  { icon: '📡', title: 'Live Render data', desc: 'Synced Postgres, no stale snapshots' },
  { icon: '🔒', title: 'Stock-safe challans', desc: 'Confirm only when inventory checks out' }
];

export default function LoginPage() {
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function pickDemo(account: string) {
    setEmail(account);
    setPassword('Password123!');
    setError('');
  }

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
      <div className="login-shell">
        <section className="login-brand">
          <div className="brand-mark">
            <div className="brand-logo">F</div>
            <div>
              <div className="brand-title">Fundsroom</div>
              <div className="brand-tag">Wholesale Command Desk</div>
            </div>
          </div>

          <div className="login-hero">
            <div className="login-eyebrow">Indian wholesale operations</div>
            <h1>
              Control customers, challans, and stock from one
              <span className="accent-word"> clean workspace.</span>
            </h1>
            <p className="hero-sub">
              Built for distributors and internal teams that need fast follow-ups,
              accurate inventory, and a simple flow from lead to confirmed sale.
            </p>
          </div>

          <div className="feature-list">
            {features.map((f) => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mini-stats">
            <div>
              <strong>4</strong>
              <small>Test roles</small>
            </div>
            <div>
              <strong>Admin · Sales</strong>
              <small>Warehouse · Accounts</small>
            </div>
            <div>
              <strong>Wholesale</strong>
              <small>Trading · Distribution</small>
            </div>
          </div>
        </section>

        <section className="login-card-wrap">
          <div className="login-card">
            <div className="form-header">
              <div className="form-kicker">Sign in with your team account</div>
              <h2>Welcome back</h2>
              <p className="form-sub">Enter your credentials to access the portal.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">Email address</span>
                <input
                  type="email"
                  placeholder="name@company.in"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span className="field-label">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>

              {error ? <div className="form-error">{error}</div> : <div className="form-spacer" />}

              <button className="primary-button" disabled={loading} type="submit">
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Signing in…
                  </span>
                ) : (
                  <>Enter portal →</>
                )}
              </button>
            </form>

            <div className="demo-section">
              <div className="demo-title">
                <span className="demo-dot" /> Quick demo login
              </div>
              <div className="demo-grid">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className={`demo-chip ${email === account.email ? 'is-active' : ''}`}
                    onClick={() => pickDemo(account.email)}
                  >
                    <span className="demo-chip-icon">{account.icon}</span>
                    <span className="demo-chip-label">{account.label}</span>
                  </button>
                ))}
              </div>
              <div className="demo-hint">
                Password for all demo accounts: <code>Password123!</code>
              </div>
            </div>
          </div>

          <div className="login-footer">
            © {new Date().getFullYear()} Fundsroom · Built for Indian distributors
          </div>
        </section>
      </div>
    </div>
  );
}
