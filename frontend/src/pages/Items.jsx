import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const GST_SLABS = [0, 5, 12, 18, 28];
const emptyForm = { name: '', hsnCode: '', price: '', gstPercent: 18 };

export default function Items() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const load = () => {
    api.get('/items', { params: search ? { search } : {} })
      .then((res) => {
        setItems(res.data);
        setCurrentPage(1);
      })
      .catch(() => setError('Could not load item catalog'));
  };

  useEffect(load, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        hsnCode: form.hsnCode,
        price: Number(form.price),
        gstPercent: Number(form.gstPercent)
      };

      if (editingId) {
        await api.put(`/items/${editingId}`, payload);
      } else {
        await api.post('/items', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save item');
    }
  };

  const handleEdit = (it) => {
    setEditingId(it.id);
    setForm({
      name: it.name,
      hsnCode: it.hsn_code || '',
      price: it.price,
      gstPercent: it.gst_percent
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const getSlabColor = (gst) => {
    switch (Number(gst)) {
      case 0: return 'bg-secondary';
      case 5: return 'bg-info text-dark';
      case 12: return 'bg-primary';
      case 18: return 'bg-warning text-dark';
      case 28: return 'bg-danger';
      default: return 'bg-dark';
    }
  };

  // Slice paginated items
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white fw-bold">
            <i className={`bi bi-${editingId ? 'pencil-square' : 'box-seam'} me-2`}></i>
            {editingId ? 'Edit Catalog Item' : 'Add New Item / Product'}
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label fw-semibold">Item / Product Name *</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Wireless Mouse / Consulting Service"
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold">HSN / SAC Code (Optional)</label>
                <input
                  className="form-control"
                  name="hsnCode"
                  value={form.hsnCode}
                  onChange={handleChange}
                  placeholder="e.g. 8471"
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold">Unit Price (Taxable Rate ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 1500.00"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">GST Rate Slab (%) *</label>
                <select
                  className="form-select"
                  name="gstPercent"
                  value={form.gstPercent}
                  onChange={handleChange}
                  required
                >
                  {GST_SLABS.map((slab) => (
                    <option key={slab} value={slab}>{slab}% GST</option>
                  ))}
                </select>
                <div className="form-text">Choose standard GST slab (0%, 5%, 12%, 18%, 28%).</div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit">
                  <i className="bi bi-check2-circle me-1"></i> {editingId ? 'Update' : 'Save'} Item
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span className="fw-bold"><i className="bi bi-list-stars me-2"></i>Reusable Product Catalog ({items.length})</span>
            <div style={{ width: 250 }}>
              <input
                className="form-control form-control-sm"
                placeholder="Search item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item Name</th>
                  <th>HSN Code</th>
                  <th className="text-end">Unit Price (₹)</th>
                  <th>GST Slab</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No items added to catalog yet</td></tr>
                )}
                {paginatedItems.map((it) => (
                  <tr key={it.id}>
                    <td className="fw-bold">{it.name}</td>
                    <td>{it.hsn_code ? <code>{it.hsn_code}</code> : <span className="text-muted">-</span>}</td>
                    <td className="text-end fw-semibold">₹{Number(it.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getSlabColor(it.gst_percent)}`}>
                        {it.gst_percent}% GST
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="text-primary fs-5 p-1 me-2 border-0 bg-transparent" title="Edit" onClick={() => handleEdit(it)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="text-danger fs-5 p-1 border-0 bg-transparent" title="Delete" onClick={() => handleDelete(it.id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>
    </div>
  );
}
