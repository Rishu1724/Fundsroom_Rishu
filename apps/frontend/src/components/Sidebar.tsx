import { Link, useLocation } from 'react-router-dom';

type User = { name: string; email: string; role: string };

export default function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/customers', label: 'Customers', icon: '👥' },
    { to: '/products', label: 'Products', icon: '📦' },
    { to: '/challans', label: 'Sales Challans', icon: '🧾' }
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-top">
          <div className="brand-mark">
            <div className="brand-logo" style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0b1736', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.25rem', boxShadow: '0 6px 18px -10px rgba(245, 158, 11, 0.8)' }}>F</div>
            <div>
              <div className="brand">Fundsroom</div>
              <div className="brand-subtitle">Wholesale command desk</div>
            </div>
          </div>
          <div className="sidebar-badge">Live</div>
        </div>

        <nav className="nav-stack">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="user-card">
        <div className="user-name">{user.name}</div>
        <div className="user-meta">{user.role}</div>
        <div className="user-meta">{user.email}</div>
        <button className="secondary-button" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}