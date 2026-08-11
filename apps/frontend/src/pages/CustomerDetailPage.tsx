import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [note, setNote] = useState('');

  async function loadCustomer() {
    if (!id) return;
    const response = await apiRequest<{ data: { customer: any } }>(`/customers/${id}`);
    setCustomer(response.data.customer);
  }

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!id) return;
    await apiRequest(`/customers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
    setNote('');
    await loadCustomer();
  }

  if (!customer) {
    return <div className="section-card">Loading customer...</div>;
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Customer detail</div>
            <h2>{customer.name}</h2>
            <p>{customer.businessName}</p>
          </div>
        </div>

        <div className="detail-grid">
          <div><small>Mobile</small><strong>{customer.mobile}</strong></div>
          <div><small>Email</small><strong>{customer.email ?? '-'}</strong></div>
          <div><small>GST</small><strong>{customer.gstNumber ?? '-'}</strong></div>
          <div><small>Status</small><span className={`status-badge status-${customer.status.toLowerCase()}`} style={{ width: 'fit-content' }}>{customer.status.toLowerCase()}</span></div>
          <div><small>Type</small><strong>{customer.customerType.charAt(0) + customer.customerType.slice(1).toLowerCase()}</strong></div>
          <div><small>Follow-up</small><strong>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString('en-IN') : '-'}</strong></div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div className="detail-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <small>Address</small>
              <strong style={{ marginTop: '0.25rem', display: 'block' }}>{customer.address}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3>Add follow-up note</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write a note" />
          <button className="primary-button">Save note</button>
        </form>
      </section>

      <section className="section-card">
        <h3>Notes</h3>
        <div className="stack-list">
          {customer.notesLog.map((item: any) => (
            <div className="stack-item" key={item.id}>
              <div>{item.note}</div>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}