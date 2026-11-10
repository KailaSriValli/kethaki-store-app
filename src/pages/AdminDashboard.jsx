import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../services/api';

const INITIAL_FORM = {
  name: '',
  category: 'Rings',
  material: '1 Gram Gold',
  purity: '22K Plated',
  weight_grams: '10.0',
  price: '',
  discount_price: '',
  available_sizes: 'Free Size',
  stock_quantity: 15,
  image_url: '',
  description: '',
  is_virtual_trial_enabled: true,
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [bulkJson, setBulkJson] = useState('');

  const fetchAll = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders/admin/all'),
      ]);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post('/products', form);
      }
      setForm(INITIAL_FORM);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save jewellery item');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      const parsedItems = JSON.parse(bulkJson);
      const { data } = await API.post('/products/bulk', { items: parsedItems });
      alert(data.message);
      setBulkJson('');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid JSON format. Please check brackets and commas.');
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const lines = event.target.result.split(/\r?\n/).filter((line) => line.trim() !== '');
        const headers = lines[0].split(',').map((h) => h.trim());

        const items = lines.slice(1).map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = cols[i];
          });
          return {
            name: obj.name,
            category: obj.category || 'Other',
            material: obj.material || '1 Gram Gold',
            price: Number(obj.price || 0),
            discount_price: Number(obj.discount_price || obj.price || 0),
            available_sizes: obj.available_sizes || 'Free Size',
            stock_quantity: Number(obj.stock_quantity || 10),
            image_url: obj.image_url,
            description: obj.description || '',
          };
        });

        const { data } = await API.post('/products/bulk', { items });
        alert(data.message);
        fetchAll();
      } catch (err) {
        alert(err.response?.data?.message || 'CSV upload failed. Ensure columns match the sample format.');
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      material: p.material,
      purity: p.purity,
      weight_grams: p.weight_grams,
      price: p.price,
      discount_price: p.discount_price || '',
      available_sizes: p.available_sizes,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url,
      description: p.description,
      is_virtual_trial_enabled: Boolean(p.is_virtual_trial_enabled),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this jewellery item?')) return;
    await API.delete(`/products/${id}`);
    fetchAll();
  };

  const handleOrderStatus = async (orderId, order_status, return_status) => {
    await API.put(`/orders/admin/status/${orderId}`, { order_status, return_status });
    fetchAll();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#4A0E1C]">Store Admin — Inventory & Orders</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              activeTab === 'products' ? 'bg-[#4A0E1C] text-amber-300' : 'bg-white border'
            }`}
          >
            Jewellery CRUD ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              activeTab === 'orders' ? 'bg-[#4A0E1C] text-amber-300' : 'bg-white border'
            }`}
          >
            Orders & Returns ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-8">
          {/* Bulk JSON / CSV Upload Box */}
          <form onSubmit={handleBulkUpload} className="bg-amber-50/70 p-5 rounded-2xl border border-amber-300 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-[#4A0E1C]">⚡ Bulk Add Multiple Items (JSON or CSV)</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setBulkJson(
                      JSON.stringify(
                        [
                          {
                            name: 'Pearl Bridal Choker',
                            category: 'Necklaces',
                            material: '1 Gram Gold',
                            price: 2500,
                            discount_price: 1999,
                            available_sizes: 'Free Size',
                            stock_quantity: 12,
                            image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
                            description: 'Elegant pearl-beaded bridal choker.',
                          },
                          {
                            name: 'Gold Plated Kada Pair',
                            category: 'Bangles',
                            material: '1 Gram Gold',
                            price: 1400,
                            discount_price: 1150,
                            available_sizes: '2.4,2.6,2.8',
                            stock_quantity: 20,
                            image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
                            description: 'Traditional screw-open bridal kada bangles.',
                          },
                        ],
                        null,
                        2
                      )
                    )
                  }
                  className="text-xs text-[#4A0E1C] underline font-semibold"
                >
                  Load Sample JSON
                </button>
                <label className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
                  Upload CSV File
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                </label>
              </div>
            </div>
            <textarea
              rows="4"
              required
              placeholder='Paste JSON array of items here or click "Load Sample JSON"...'
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              className="w-full p-3 bg-white border border-amber-200 rounded-xl font-mono text-xs"
            />
            <button
              type="submit"
              className="bg-[#4A0E1C] text-amber-300 px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#631527]"
            >
              Upload JSON Items
            </button>
          </form>

          {/* Add / Update Single Product Form */}
          <form
            onSubmit={handleSaveProduct}
            className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <h3 className="md:col-span-3 font-bold text-lg text-[#4A0E1C]">
              {editingId ? `Update Jewellery #${editingId}` : 'Add Single Jewellery Item'}
            </h3>

            <input
              type="text"
              placeholder="Item Name (e.g. Temple Gold Jhumkas)"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            >
              {['Rings', 'Earrings', 'Bangles', 'Chains', 'Bracelets', 'Anklets', 'Necklaces', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            >
              {['Gold', '1 Gram Gold', 'Silver', 'Rose Gold', 'Imitation', 'Diamond'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Original Price (₹)"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            />

            <input
              type="number"
              placeholder="Offer / Discount Price (₹)"
              value={form.discount_price}
              onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            />

            <input
              type="text"
              placeholder="Sizes (e.g. 2.4,2.6,2.8 or Free Size)"
              value={form.available_sizes}
              onChange={(e) => setForm({ ...form, available_sizes: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            />

            <input
              type="url"
              placeholder="Image URL (https://...)"
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="p-2.5 border rounded-xl text-sm md:col-span-2"
            />

            <input
              type="number"
              placeholder="Stock Qty"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              className="p-2.5 border rounded-xl text-sm"
            />

            <input
              type="text"
              placeholder="Short Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="p-2.5 border rounded-xl text-sm md:col-span-2"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#4A0E1C] text-amber-300 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Save Changes' : 'Add Item'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(INITIAL_FORM);
                  }}
                  className="px-4 py-2.5 border rounded-xl text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Product List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-amber-50 text-[#4A0E1C]">
                <tr>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="p-3.5 flex items-center gap-3 font-medium">
                      <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3.5">{p.category}</td>
                    <td className="p-3.5">{p.material}</td>
                    <td className="p-3.5 font-semibold">₹{Number(p.discount_price || p.price).toLocaleString('en-IN')}</td>
                    <td className="p-3.5">{p.stock_quantity}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Admin Orders & Returns Management */
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-amber-50 text-[#4A0E1C]">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Transaction</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Return Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3.5 font-bold">#{o.id}</td>
                  <td className="p-3.5">
                    {o.full_name}
                    <span className="block text-xs text-gray-500">{o.phone} • {o.pincode}</span>
                  </td>
                  <td className="p-3.5 font-mono text-xs">{o.transaction_ref}</td>
                  <td className="p-3.5 font-semibold">₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td className="p-3.5">
                    <select
                      value={o.order_status}
                      onChange={(e) => handleOrderStatus(o.id, e.target.value, null)}
                      className="border rounded-lg px-2 py-1 text-xs"
                    >
                      {['Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
                        <option key={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3.5">
                    {o.return_id ? (
                      <select
                        value={o.return_status}
                        onChange={(e) => handleOrderStatus(o.id, null, e.target.value)}
                        className="border border-orange-300 bg-orange-50 rounded-lg px-2 py-1 text-xs"
                      >
                        {['Requested', 'Approved', 'Picked Up', 'Refunded', 'Rejected'].map((rs) => (
                          <option key={rs}>{rs}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">No Return</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}