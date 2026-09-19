import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [partySearch, setPartySearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBillForWhatsApp, setSelectedBillForWhatsApp] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const loadBills = () => {
    setLoading(true);
    const params = {};
    if (partySearch) params.party = partySearch;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    if (statusFilter) params.status = statusFilter;

    api.get('/bills', { params })
      .then((res) => {
        setBills(res.data);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadBills, [partySearch, fromDate, toDate, statusFilter]);

  const handleReset = () => {
    setPartySearch('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
  };

  const exportCsv = async () => {
    try {
      const res = await api.get('/bills/export/csv', { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `GSTKhata_Bills_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert('Failed to export bill history CSV');
    }
  };

  // Slice paginated items
  const paginatedBills = bills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <WhatsAppShareModal
        bill={selectedBillForWhatsApp}
        shop={selectedBillForWhatsApp?.shop}
        show={!!selectedBillForWhatsApp}
        onClose={() => setSelectedBillForWhatsApp(null)}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-primary"></i>Invoice History</h4>
        <button className="btn btn-success btn-sm" onClick={exportCsv}>
          <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export Bill History (CSV)
        </button>
      </div>

      {/* Filter Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Party / Customer Name</label>
              <input
                className="form-control form-control-sm"
                placeholder="Search party..."
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Payment Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button className="btn btn-sm btn-secondary w-100" onClick={handleReset}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table Card */}
      <div className="card shadow-sm">
        {/* Desktop Table View */}
        <div className="table-responsive d-none d-md-block">
          <table className="table table-hover table-sm mb-0 align-middle">
            <thead className="table-dark">
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Party Name</th>
                <th>Party State</th>
                <th>Tax Type</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">Total Tax</th>
                <th className="text-end">Grand Total</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan="10" className="text-center text-muted py-4">No matching invoices found</td></tr>
              ) : (
                paginatedBills.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link to={`/bills/${b.id}`} className="fw-bold text-decoration-none">
                        {b.invoice_no}
                      </Link>
                    </td>
                    <td>{new Date(b.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td className="fw-semibold">{b.party_name}</td>
                    <td><span className="badge bg-light text-dark border">{b.party_state}</span></td>
                    <td><span className="badge bg-secondary">{b.tax_type}</span></td>
                    <td className="text-end">₹{Number(b.subtotal).toFixed(2)}</td>
                    <td className="text-end text-muted">₹{Number(b.total_tax).toFixed(2)}</td>
                    <td className="text-end fw-bold text-success">₹{Number(b.grand_total).toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-success p-1"
                          onClick={() => setSelectedBillForWhatsApp(b)}
                          title="Share Invoice on WhatsApp"
                        >
                          <i className="bi bi-whatsapp fs-5"></i>
                        </button>
                        <Link to={`/bills/${b.id}`} className="text-primary fs-5 p-1 d-inline-flex align-items-center" title="View Invoice">
                          <i className="bi bi-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="d-block d-md-none p-3">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></div>
          ) : bills.length === 0 ? (
            <div className="text-center text-muted py-4">No matching invoices found</div>
          ) : (
            paginatedBills.map((b) => (
              <div key={b.id} className="card border mb-3 shadow-sm rounded-3">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Link to={`/bills/${b.id}`} className="fw-bold fs-6 text-decoration-none text-primary">
                        {b.invoice_no}
                      </Link>
                      <small className="text-muted d-block">{new Date(b.invoice_date).toLocaleDateString('en-IN')}</small>
                    </div>
                    <span className={`badge bg-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="my-2 py-2 border-top border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark">{b.party_name}</span>
                      <span className="badge bg-light text-dark border">{b.party_state}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center text-muted small">
                      <span>Tax Type: <span className="badge bg-secondary">{b.tax_type}</span></span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 small">
                    <div>
                      <span className="text-muted d-block">Subtotal: ₹{Number(b.subtotal).toFixed(2)}</span>
                      <span className="text-muted d-block">Tax: ₹{Number(b.total_tax).toFixed(2)}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-muted d-block small">Grand Total</span>
                      <strong className="fs-5 text-success">₹{Number(b.grand_total).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="d-flex gap-2 border-top pt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success flex-grow-1"
                      onClick={() => setSelectedBillForWhatsApp(b)}
                    >
                      <i className="bi bi-whatsapp me-1"></i> WhatsApp
                    </button>
                    <Link to={`/bills/${b.id}`} className="btn btn-sm btn-primary flex-grow-1">
                      <i className="bi bi-eye me-1"></i> View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={bills.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(size) => setItemsPerPage(size)}
        />
      </div>
    </div>
  );
}
