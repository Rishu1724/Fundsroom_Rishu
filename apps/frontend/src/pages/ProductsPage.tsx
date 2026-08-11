import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
};

const emptyForm = {
  name: '', sku: '', category: '', unitPrice: 0, currentStock: 0, minStockAlert: 0, location: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);

  async function loadProducts() {
    const response = await apiRequest<{ data: { items: Product[] } }>('/products');
    setProducts(response.data.items);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify({ ...form, unitPrice: Number(form.unitPrice), currentStock: Number(form.currentStock), minStockAlert: Number(form.minStockAlert) })
    });
    setForm(emptyForm);
    await loadProducts();
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Inventory</div>
            <h2>Products</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.currentStock}</td>
                  <td>{product.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">Add Product</div>
            <h2>Create inventory item</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <input type="number" placeholder="Unit price" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: Number(event.target.value) })} />
          <input type="number" placeholder="Current stock" value={form.currentStock} onChange={(event) => setForm({ ...form, currentStock: Number(event.target.value) })} />
          <input type="number" placeholder="Minimum alert" value={form.minStockAlert} onChange={(event) => setForm({ ...form, minStockAlert: Number(event.target.value) })} />
          <input placeholder="Location / warehouse" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <button className="primary-button" type="submit">Save product</button>
        </form>
      </section>
    </div>
  );
}