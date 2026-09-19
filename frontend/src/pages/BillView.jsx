import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { formatCurrency } from '../utils/formatters';

export default function BillView() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    api.get(`/bills/${id}`)
      .then((res) => setBill(res.data))
      .catch(() => setError('Could not load bill details'));
  }, [id]);

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Invoice_${bill?.invoice_no || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Failed to download PDF invoice');
    }
  };

  const printInvoice = async () => {
    try {
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;

      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 300);
      };
    } catch {
      alert('Failed to print PDF invoice');
    }
  };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  const sendEmail = async () => {
    setSendingEmail(true);
    setEmailSuccess('');
    try {
      const res = await api.post(`/bills/${id}/send-email`);
      setEmailSuccess(res.data.message || 'Invoice email sent successfully!');
      setTimeout(() => setEmailSuccess(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invoice email');
    } finally {
      setSendingEmail(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await api.patch(`/bills/${id}/status`, { status });
      setBill({ ...bill, status: res.data.status });
    } catch {
      alert('Failed to update status');
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!bill) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const shop = bill.shop || {};
  const isIgst = bill.tax_type === 'IGST';

  return (
    <div>
      {emailSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-3 print-hide" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{emailSuccess}
          <button type="button" className="btn-close" onClick={() => setEmailSuccess('')}></button>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        bill={bill}
        shop={shop}
        show={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />

      {/* Top Action Bar (hidden when printing) */}
      <div className="d-flex justify-content-between align-items-center mb-3 print-hide">
        <Link to="/bills" className="btn btn-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Invoices
        </Link>
        <div className="d-flex gap-2">
          <button className="btn btn-dark btn-sm" onClick={sendEmail} disabled={sendingEmail}>
            {sendingEmail ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span> Sending...
              </>
            ) : (
              <>
                <i className="bi bi-envelope-at me-1"></i> Send Email
              </>
            )}
          </button>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => setShowWhatsAppModal(true)}>
            <i className="bi bi-whatsapp me-1"></i> Share WhatsApp
          </button>
          <button className="btn btn-primary btn-sm" onClick={printInvoice}>
            <i className="bi bi-printer me-1"></i> Print Invoice
          </button>
          <button className="btn btn-primary btn-sm" onClick={downloadPdf}>
            <i className="bi bi-download me-1"></i> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Document View */}
      <div className="card shadow p-4 bg-white border">
        {/* Header Banner */}
        <div className="bg-dark text-white p-4 rounded mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="fw-bold mb-1">{shop.shop_name || 'Darshan Electronics & Retail'}</h3>
              <div className="small opacity-75">{shop.address || 'Rajkot, Gujarat'}</div>
              <div className="small opacity-75">
                GSTIN: <strong>{shop.gstin || '24AAACD1234E1Z5'}</strong> | State: <strong>{shop.state || 'Gujarat'}</strong> | Phone: {shop.phone || ''}
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <span className="badge bg-warning text-dark fs-6 px-3 py-2">TAX INVOICE</span>
            </div>
          </div>
        </div>

        {/* Invoice & Party Metadata */}
        <div className="row mb-3">
          <div className="col-6 border-end">
            <h6 className="text-uppercase text-muted fw-bold small mb-2">Invoice Information</h6>
            <div className="mb-1"><strong>Invoice No:</strong> {bill.invoice_no}</div>
            <div className="mb-1"><strong>Date:</strong> {new Date(bill.invoice_date).toLocaleDateString('en-IN')}</div>
            <div className="mb-1"><strong>Tax Type:</strong> {isIgst ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</div>
            <div className="mb-1 d-flex align-items-center print-hide">
              <strong className="me-2">Payment Status:</strong>
              <select
                className="form-select form-select-sm w-auto d-inline-block"
                value={bill.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="col-6 ps-3">
            <h6 className="text-uppercase text-muted fw-bold small mb-2">Billed To (Customer)</h6>
            <div className="fw-bold fs-6">{bill.party_name}</div>
            {bill.party_mobile && <div><strong>Mobile:</strong> {bill.party_mobile}</div>}
            <div><strong>State:</strong> {bill.party_state}</div>
            {bill.party_gstin && <div><strong>GSTIN:</strong> <code>{bill.party_gstin}</code></div>}
            {bill.party_address && <div className="text-muted small">Address: {bill.party_address}</div>}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-sm align-middle mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>HSN</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Rate</th>
                <th className="text-end">Taxable</th>
                <th className="text-center">GST %</th>
                {!isIgst ? (
                  <>
                    <th className="text-end">CGST</th>
                    <th className="text-end">SGST</th>
                  </>
                ) : (
                  <th className="text-end">IGST</th>
                )}
                <th className="text-end">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td className="fw-bold">{it.name}</td>
                  <td>{it.hsn_code || '-'}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-end">₹{formatCurrency(it.rate)}</td>
                  <td className="text-end">₹{formatCurrency(it.taxable_amt)}</td>
                  <td className="text-center">{it.gst_percent}%</td>
                  {!isIgst ? (
                    <>
                      <td className="text-end">₹{formatCurrency(it.cgst)}</td>
                      <td className="text-end">₹{formatCurrency(it.sgst)}</td>
                    </>
                  ) : (
                    <td className="text-end">₹{formatCurrency(it.igst)}</td>
                  )}
                  <td className="text-end fw-bold">₹{formatCurrency(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="row g-3">
          <div className="col-6">
            {bill.notes && (
              <div className="p-2 bg-light rounded border mb-2">
                <h6 className="fw-bold small mb-1">Notes & Terms:</h6>
                <div className="text-muted small">{bill.notes}</div>
              </div>
            )}
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              <div>1. Goods once sold will not be taken back.</div>
              <div>2. Subject to local jurisdiction.</div>
              <div>3. Saved bills are read-only and immutable.</div>
            </div>
          </div>

          <div className="col-6">
            <div className="card bg-light border">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Subtotal (Taxable):</span>
                  <span className="fw-semibold">₹{formatCurrency(bill.subtotal)}</span>
                </div>

                {Number(bill.discount) > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-danger">
                    <span>Discount:</span>
                    <span>- ₹{formatCurrency(bill.discount)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-1">
                  <span>Total Tax Collected:</span>
                  <span className="fw-semibold">₹{formatCurrency(bill.total_tax)}</span>
                </div>

                <hr className="my-1" />

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-5 fw-bold">Grand Total:</span>
                  <span className="fs-4 fw-bold text-success">₹{formatCurrency(bill.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
