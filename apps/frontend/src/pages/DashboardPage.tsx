import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import StatCard from '../components/StatCard';

type Summary = { customers: number; products: number; challans: number; lowStockProducts: number };

const inr = new Intl.NumberFormat('en-IN');

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    apiRequest<{ data: { summary: Summary } }>('/dashboard/summary').then((response) => setSummary(response.data.summary));
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-card dashboard-hero">
        <div className="hero-copy">
          <div className="eyebrow">Operations overview</div>
          <h1>Built for Indian wholesale teams that move fast and keep records tight.</h1>
          <p>
            Track customer follow-ups, stock health, and challan confirmations from one live dashboard
            backed by the Render database.
          </p>

          <div className="hero-pills">
            <span>GST-style operations</span>
            <span>Warehouse-first workflow</span>
            <span>Confirm stock only when ready</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-badge">Live from Render</div>
          <div className="hero-stat-grid">
            <div>
              <small>Customers</small>
              <strong>{summary ? inr.format(summary.customers) : '...'}</strong>
            </div>
            <div>
              <small>Products</small>
              <strong>{summary ? inr.format(summary.products) : '...'}</strong>
            </div>
            <div>
              <small>Challans</small>
              <strong>{summary ? inr.format(summary.challans) : '...'}</strong>
            </div>
            <div>
              <small>Low stock</small>
              <strong>{summary ? inr.format(summary.lowStockProducts) : '...'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Customers" value={summary?.customers ?? '...'} />
        <StatCard label="Products" value={summary?.products ?? '...'} />
        <StatCard label="Challans" value={summary?.challans ?? '...'} />
        <StatCard label="Low stock alerts" value={summary?.lowStockProducts ?? '...'} tone="warning" />
      </section>

      <section className="section-card note-strip">
        <div>
          <strong>Quick note</strong>
          <p>Data is being fetched live from your Render-hosted API, not mocked locally.</p>
        </div>
        <div className="note-pill">Single source of truth</div>
      </section>
    </div>
  );
}