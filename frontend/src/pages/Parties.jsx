import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
  'Jammu & Kashmir', 'Ladakh'
];

const emptyForm = { name: '', mobile: '', address: '', state: 'Gujarat', gstin: '', email: 'rmbinsuranceservice776@gmail.com' };

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Pagination for main parties table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // History Modal State & Pagination
  const [selectedPartyHistory, setSelectedPartyHistory] = useState(null);
  const [historyBills, setHistoryBills] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 5;

  const load = () => {
    api.get('/parties', { params: search ? { search } : {} })
      .then((res) => {
        setParties(res.data);
        setCurrentPage(1);
      })
      .catch(() => setError('Could not load parties'));
  };

  useEffect(load, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/parties/${editingId}`, form);
      } else {
        await api.post('/parties', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save party');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      mobile: p.mobile,
      address: p.address || '',
      state: p.state || 'Gujarat',
      gstin: p.gstin || '',
      email: p.email || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this party?')) return;
    try {
      await api.delete(`/parties/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete party');
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const viewHistory = async (party) => {
    setSelectedPartyHistory(party);
    setHistoryLoading(true);
    setHistoryPage(1);
    try {
      const res = await api.get(`/parties/${party.id}/bills`);
      setHistoryBills(res.data);
    } catch {
      alert('Failed to fetch bill history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Slice paginated items
  const paginatedParties = parties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedHistoryBills = historyBills.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage);

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white fw-bold">
            <i className={`bi bi-${editingId ? 'pencil-square' : 'person-plus'} me-2`}></i>
            {editingId ? 'Edit Party Details' : 'Add New Customer / Party'}
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label fw-semibold">Customer / Party Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Acme Enterprises" />
              </div>
              <div className="mb-2">
                <label className="form-label fw-semibold">Mobile Number *</label>
                <input className="form-control" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="e.g. 9876543210" />
              </div>
              <div className="mb-2">
                <label className="form-label fw-semibold">State *</label>
                <select className="form-select" name="state" value={form.state} onChange={handleChange} required>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="form-text">Required for CGST+SGST vs IGST split.</div>
              </div>
              <div className="mb-2">
                <label className="form-label fw-semibold">Billing Address</label>
                <textarea className="form-control" name="address" rows="2" value={form.address} onChange={handleChange} placeholder="Address" />
              </div>
              <div className="mb-2">
                <label className="form-label fw-semibold">GSTIN (Optional)</label>
                <input className="form-control text-uppercase" name="gstin" value={form.gstin} onChange={handleChange} placeholder="24AAAAA0000A1Z5" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email (Optional)</label>
                <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="party@example.com" />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit">
                  <i className="bi bi-check2-circle me-1"></i> {editingId ? 'Update' : 'Save'} Party
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
            <span className="fw-bold"><i className="bi bi-people me-2"></i>Parties List ({parties.length})</span>
            <div style={{ width: 250 }}>
              <input
                className="form-control form-control-sm"
                placeholder="Search name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>State</th>
                  <th>GSTIN</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No parties registered yet</td></tr>
                )}
                {paginatedParties.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold">{p.name}</div>
                      {p.email && <div className="text-muted small">{p.email}</div>}
                    </td>
                    <td>{p.mobile}</td>
                    <td><span className="badge bg-light text-dark border">{p.state}</span></td>
                    <td>{p.gstin ? <code className="text-dark">{p.gstin}</code> : <span className="text-muted">-</span>}</td>
                    <td className="text-end">
                      <button className="text-info fs-5 p-1 me-2 border-0 bg-transparent" title="Bill History" onClick={() => viewHistory(p)}>
                        <i className="bi bi-clock-history"></i>
                      </button>
                      <button className="text-primary fs-5 p-1 me-2 border-0 bg-transparent" title="Edit" onClick={() => handleEdit(p)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="text-danger fs-5 p-1 border-0 bg-transparent" title="Delete" onClick={() => handleDelete(p.id)}>
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
            totalItems={parties.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Single Party Bill History Modal */}
      {selectedPartyHistory && (
        <div className="modal show d-block party-history-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Bill History for {selectedPartyHistory.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPartyHistory(null)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="row m-3 bg-light p-3 rounded">
                  <div className="col-md-4"><strong>Mobile:</strong> {selectedPartyHistory.mobile}</div>
                  <div className="col-md-4"><strong>State:</strong> {selectedPartyHistory.state}</div>
                  <div className="col-md-4"><strong>GSTIN:</strong> {selectedPartyHistory.gstin || 'N/A'}</div>
                </div>

                {historyLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
                ) : historyBills.length === 0 ? (
                  <div className="text-center text-muted py-4">No bills found for this customer.</div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-sm table-striped align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Invoice No</th>
                            <th>Date</th>
                            <th>Tax Type</th>
                            <th className="text-end">Grand Total</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedHistoryBills.map((b) => (
                            <tr key={b.id}>
                              <td className="fw-bold">{b.invoice_no}</td>
                              <td>{new Date(b.invoice_date).toLocaleDateString('en-IN')}</td>
                              <td><span className="badge bg-secondary">{b.tax_type}</span></td>
                              <td className="text-end fw-bold">₹{Number(b.grand_total).toFixed(2)}</td>
                              <td>
                                <span className={`badge bg-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <Link to={`/bills/${b.id}`} className="text-primary fs-5 p-1 d-inline-flex align-items-center" title="View Invoice" onClick={() => setSelectedPartyHistory(null)}>
                                  <i className="bi bi-eye"></i>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={historyPage}
                      totalItems={historyBills.length}
                      itemsPerPage={historyItemsPerPage}
                      onPageChange={(page) => setHistoryPage(page)}
                    />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <Link to="/create-bill" className="btn btn-success" onClick={() => setSelectedPartyHistory(null)}>
                  <i className="bi bi-plus-lg me-1"></i> Create New Bill for {selectedPartyHistory.name}
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPartyHistory(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
