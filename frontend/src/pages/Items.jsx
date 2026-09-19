import { useEffect, useState } from 'react';
import api from '../api/axios';
import Validator from '../utils/validator';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Pagination from '../components/Pagination';
import { formatCurrency } from '../utils/formatters';

const emptyForm = { name: '', hsnCode: '', price: '', gstPercent: 0 };

export default function Items() {
  const [items, setItems] = useState([]);
  const [gstRates, setGstRates] = useState([
    { id: 1, rate: 0 },
    { id: 2, rate: 5 },
    { id: 3, rate: 12 },
    { id: 4, rate: 18 },
    { id: 5, rate: 28 },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Add/Manage GST Suggestion Modal
  const [showAddGstModal, setShowAddGstModal] = useState(false);
  const [newGstRateInput, setNewGstRateInput] = useState('');
  const [gstModalMsg, setGstModalMsg] = useState({ type: '', text: '' });
  const [gstSubmitting, setGstSubmitting] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const loadItems = () => {
    api.get('/items', { params: search ? { search } : {} })
      .then((res) => {
        setItems(res.data);
        setCurrentPage(1);
      })
      .catch(() => setError('Could not load item catalog'));
  };

  const loadGstRates = async () => {
    try {
      const res = await api.get('/gst-rates');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setGstRates(res.data);
      }
    } catch (err) {
      console.error('Failed to load GST rate suggestions:', err);
    }
  };

  useEffect(() => {
    loadItems();
    loadGstRates();
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGstSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM_INPUT__') {
      setIsCustomMode(true);
    } else if (val === '__ADD_NEW_SUGGESTION__') {
      setGstModalMsg({ type: '', text: '' });
      setNewGstRateInput('');
      setShowAddGstModal(true);
    } else {
      setIsCustomMode(false);
      setForm({ ...form, gstPercent: Number(val) });
    }
  };

  const handleAddGstSuggestion = async (e) => {
    e.preventDefault();
    setGstModalMsg({ type: '', text: '' });

    const numRate = Number(newGstRateInput);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      return setGstModalMsg({ type: 'danger', text: 'Enter a valid rate percentage (0 - 100)' });
    }

    setGstSubmitting(true);
    try {
      const res = await api.post('/gst-rates', { rate: numRate });
      const addedRate = res.data.rate;
      await loadGstRates();

      setGstModalMsg({ type: 'success', text: `GST rate ${addedRate.rate}% added to suggestions!` });
      setForm((prev) => ({ ...prev, gstPercent: addedRate.rate }));
      setIsCustomMode(false);
      setNewGstRateInput('');
      setShowAddGstModal(false);
    } catch (err) {
      setGstModalMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to add GST rate suggestion' });
    } finally {
      setGstSubmitting(false);
    }
  };

  const handleDeleteGstSuggestion = async (rateObj) => {
    if (!rateObj.id) return;
    try {
      await api.delete(`/gst-rates/${rateObj.id}`);
      await loadGstRates();
      setGstModalMsg({ type: 'success', text: `Deleted ${rateObj.rate}% GST rate suggestion!` });
    } catch (err) {
      setGstModalMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to delete GST rate suggestion' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Reusable Validator Check
    const validation = Validator.validate(form, {
      name: { required: true, label: 'Item / Product Name' },
      price: { required: true, positive: true, label: 'Unit Price' },
    });

    if (!validation.isValid) {
      return setError(Object.values(validation.errors)[0]);
    }

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
      setIsCustomMode(false);
      setEditingId(null);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save item');
    }
  };

  const handleEdit = (it) => {
    setEditingId(it.id);
    const existingRate = Number(it.gst_percent);
    const isSuggested = gstRates.some((r) => Number(r.rate) === existingRate);

    setForm({
      name: it.name,
      hsnCode: it.hsn_code || '',
      price: it.price,
      gstPercent: existingRate
    });
    setIsCustomMode(!isSuggested);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/items/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsCustomMode(false);
  };

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

  const isCurrentInSuggestions = gstRates.some((r) => Number(r.rate) === Number(form.gstPercent));

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center">
            <span>
              <i className={`bi bi-${editingId ? 'pencil-square' : 'box-seam'} me-2`}></i>
              {editingId ? 'Edit Catalog Item' : 'Add New Item / Product'}
            </span>
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
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold mb-0">GST Rate Slab (%) *</label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => {
                      setGstModalMsg({ type: '', text: '' });
                      setNewGstRateInput('');
                      setShowAddGstModal(true);
                    }}
                  >
                    + Manage GST Suggestions
                  </button>
                </div>

                {!isCustomMode ? (
                  <select
                    className="form-select"
                    name="gstPercent"
                    value={isCurrentInSuggestions ? form.gstPercent : '__CUSTOM_INPUT__'}
                    onChange={handleGstSelectChange}
                    required
                  >
                    {gstRates.map((item) => (
                      <option key={item.id || item.rate} value={item.rate}>
                        {item.rate}% GST
                      </option>
                    ))}
                    <option value="__CUSTOM_INPUT__">+ Enter Custom GST Rate...</option>
                    <option value="__ADD_NEW_SUGGESTION__">+ Add New Rate Suggestion to List...</option>
                  </select>
                ) : (
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-control"
                      name="gstPercent"
                      value={form.gstPercent}
                      onChange={handleChange}
                      placeholder="e.g. 3.5 or 15"
                      required
                    />
                    <span className="input-group-text">%</span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      title="Switch back to suggested rates"
                      onClick={() => setIsCustomMode(false)}
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                )}
                <div className="form-text">
                  Choose from suggestions or click &quot;+ Enter Custom GST Rate&quot; to type any percentage.
                </div>
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
          {/* Desktop Table View */}
          <div className="table-responsive d-none d-md-block">
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
                    <td className="text-end fw-semibold">₹{formatCurrency(it.price)}</td>
                    <td>
                      <span className={`badge ${getSlabColor(it.gst_percent)}`}>
                        {Number(it.gst_percent)}% GST
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <div className="d-inline-flex align-items-center justify-content-end gap-1">
                        <button className="text-primary fs-5 p-1 border-0 bg-transparent" title="Edit" onClick={() => handleEdit(it)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="text-danger fs-5 p-1 border-0 bg-transparent" title="Delete" onClick={() => setDeleteTarget(it)}>
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="d-block d-md-none p-3">
            {items.length === 0 ? (
              <div className="text-center text-muted py-4">No items added to catalog yet</div>
            ) : (
              paginatedItems.map((it) => (
                <div key={it.id} className="card border mb-3 shadow-sm rounded-3">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-dark mb-0">{it.name}</h6>
                      <span className={`badge ${getSlabColor(it.gst_percent)}`}>
                        {Number(it.gst_percent)}% GST
                      </span>
                    </div>

                    <div className="row g-2 my-2 py-2 border-top border-bottom small">
                      <div className="col-6">
                        <span className="text-muted d-block">Unit Price:</span>
                        <span className="fw-bold text-primary fs-6">₹{formatCurrency(it.price)}</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">HSN Code:</span>
                        {it.hsn_code ? <code className="text-dark">{it.hsn_code}</code> : <span className="text-muted">—</span>}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 border-top pt-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(it)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(it)}>
                        <i className="bi bi-trash3 me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

      {/* Manage GST Rate Suggestions Modal */}
      {showAddGstModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-percent me-2"></i>Manage GST Rate Suggestions
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddGstModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {gstModalMsg.text && <div className={`alert alert-${gstModalMsg.type} py-2 small mb-3`}>{gstModalMsg.text}</div>}

                {/* Form to Add New Suggestion */}
                <form onSubmit={handleAddGstSuggestion} className="card border p-3 bg-light mb-4 shadow-sm">
                  <label className="form-label fw-semibold small mb-2">Add New GST Rate Suggestion (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-control"
                      placeholder="e.g. 3 or 7.5"
                      value={newGstRateInput}
                      onChange={(e) => setNewGstRateInput(e.target.value)}
                      required
                    />
                    <span className="input-group-text">%</span>
                    <button type="submit" className="btn btn-primary" disabled={gstSubmitting}>
                      {gstSubmitting ? 'Saving...' : 'Add Suggestion'}
                    </button>
                  </div>
                </form>

                {/* Existing Suggestions List with Delete Buttons */}
                <div className="border rounded p-3 bg-white shadow-sm">
                  <small className="text-muted fw-semibold d-block mb-2">
                    Active Rate Suggestions ({gstRates.length}) — Click <i className="bi bi-x-circle text-danger ms-1"></i> to delete:
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {gstRates.map((r) => (
                      <span key={r.id || r.rate} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fs-6 px-3 py-2 rounded-pill shadow-sm">
                        <span className="fw-bold">{r.rate}% GST</span>
                        {r.id && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 ms-1 text-danger text-decoration-none"
                            style={{ fontSize: '0.85rem', lineHeight: 1 }}
                            title={`Delete ${r.rate}% rate suggestion`}
                            onClick={() => handleDeleteGstSuggestion(r)}
                          >
                            <i className="bi bi-x-circle-fill"></i>
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddGstModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Item from Catalog"
        message="Are you sure you want to delete this product from your catalog?"
        itemName={deleteTarget?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
