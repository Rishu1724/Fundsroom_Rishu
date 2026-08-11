import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

type Customer = { id: string; name: string };
type Product = { id: string; name: string; sku: string; unitPrice: number; currentStock: number };
type Challan = { id: string; challanNumber: string; status: string; totalQuantity: number; totalAmount: number; createdAt: string; customer: { name: string } };

export default function ChallansPage() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('DRAFT');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  async function loadData() {
    const [challansResponse, customersResponse, productsResponse] = await Promise.all([
      apiRequest<{ data: { items: Challan[] } }>('/challans'),
      apiRequest<{ data: { items: Customer[] } }>('/customers?limit=100'),
      apiRequest<{ data: { items: Product[] } }>('/products')
    ]);
    setChallans(challansResponse.data.items);
    setCustomers(customersResponse.data.items);
    setProducts(productsResponse.data.items);
  }

  useEffect(() => {
    loadData();
  }, []);

  function addItem() {
    if (!selectedProductId) return;
    setItems((current) => [...current, { productId: selectedProductId, quantity }]);
    setSelectedProductId('');
    setQuantity(1);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await apiRequest('/challans', {
      method: 'POST',
      body: JSON.stringify({ customerId, status, items })
    });
    setItems([]);
    setCustomerId('');
    setStatus('DRAFT');
    await loadData();
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Sales Flow</div>
            <h2>Challans</h2>
            <p>Create a draft first, then confirm only when stock is available.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="inline-form full-width">
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.currentStock} in stock)</option>)}
            </select>
            <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <button type="button" className="secondary-button" onClick={addItem}>Add item</button>
          </div>

          <div className="stack-list full-width">
            {items.map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);
              return (
                <div className="stack-item" key={`${item.productId}-${index}`}>
                  <span>{product?.name ?? item.productId}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              );
            })}
          </div>

          <button className="primary-button full-width" type="submit" disabled={!customerId || items.length === 0}>Save challan</button>
        </form>
      </section>

      <section className="section-card">
        <h3>Recent challans</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Qty</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td><strong>{challan.challanNumber}</strong></td>
                  <td>{challan.customer?.name}</td>
                  <td><span className={`status-badge status-${challan.status.toLowerCase()}`}>{challan.status.toLowerCase()}</span></td>
                  <td>{challan.totalQuantity}</td>
                  <td>₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}