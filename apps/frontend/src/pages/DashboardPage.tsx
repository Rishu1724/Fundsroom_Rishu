import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import StatCard from '../components/StatCard';

type Summary = { customers: number; products: number; challans: number; lowStockProducts: number };

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    apiRequest<{ data: { summary: Summary } }>('/dashboard/summary').then((response) => setSummary(response.data.summary));
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <div className="eyebrow">Operations Overview</div>
          <h1>ERP + CRM command center</h1>
          <p>Track customer activity, stock health, and sales challans from a single internal dashboard.</p>
        </div>
        <div className="hero-badge">Role-based access enabled</div>
      </section>

      <section className="stat-grid">
        <StatCard label="Customers" value={summary?.customers ?? '...'} />
        <StatCard label="Products" value={summary?.products ?? '...'} />
        <StatCard label="Challans" value={summary?.challans ?? '...'} />
        <StatCard label="Low Stock Alerts" value={summary?.lowStockProducts ?? '...'} tone="warning" />
      </section>
    </div>
  );
}