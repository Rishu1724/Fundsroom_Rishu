import { Link, useLocation } from 'react-router-dom';

type User = { name: string; email: string; role: string };

export default function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/products', label: 'Products' },
    { to: '/challans', label: 'Sales Challans' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div>
          <div className="brand">Fundsroom</div>
          <div className="brand-subtitle">Wholesale command desk</div>
        </div>
        <div className="sidebar-badge">Live data</div>
      </div>

      <nav className="nav-stack">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="user-card">
        <div className="user-name">{user.name}</div>
        <div className="user-meta">{user.role}</div>
        <div className="user-meta">{user.email}</div>
        <button className="secondary-button" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}