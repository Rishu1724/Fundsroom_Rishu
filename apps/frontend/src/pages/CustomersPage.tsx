import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  customerType: string;
  status: string;
  followUpDate: string | null;
};

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'WHOLESALE',
  address: '',
  status: 'LEAD',
  followUpDate: '',
  notes: ''
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  async function loadCustomers(query = '') {
    const response = await apiRequest<{ data: { items: Customer[] } }>(`/customers?search=${encodeURIComponent(query)}`);
    setCustomers(response.data.items);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        email: form.email || undefined,
        gstNumber: form.gstNumber || undefined,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes || undefined,
        unitPrice: undefined
      })
    });
    setForm(emptyForm);
    await loadCustomers(search);
  }

  async function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    await loadCustomers(search);
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Customer CRM</div>
            <h2>Customers</h2>
          </div>
          <form className="inline-form" onSubmit={handleSearchSubmit}>
            <input placeholder="Search customer" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button className="secondary-button">Search</button>
          </form>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.businessName}</td>
                  <td>{customer.mobile}</td>
                  <td>{customer.customerType}</td>
                  <td>{customer.status}</td>
                  <td><Link to={`/customers/${customer.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Add New</div>
            <h2>Create customer</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Customer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder="Mobile number" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input placeholder="Business name" value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} />
          <input placeholder="GST number" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
          <select value={form.customerType} onChange={(event) => setForm({ ...form, customerType: event.target.value })}>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <input placeholder="Follow-up date ISO" value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} />
          <textarea placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <button className="primary-button" type="submit">Save customer</button>
        </form>
      </section>
    </div>
  );
}