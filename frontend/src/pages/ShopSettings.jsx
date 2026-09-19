import { useEffect, useState } from 'react';
import api from '../api/axios';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
  'Jammu & Kashmir', 'Ladakh'
];

export default function ShopSettings() {
  const [form, setForm] = useState({
    shop_name: '',
    address: '',
    state: 'Gujarat',
    gstin: '',
    phone: '',
    email: '',
    invoice_prefix: 'INV-'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/shop')
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: 'danger', text: 'Failed to load shop settings' });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/shop', form);
      setForm(res.data);
      setMessage({ type: 'success', text: 'Shop settings updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update shop settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white d-flex align-items-center">
            <i className="bi bi-shop me-2 fs-5"></i>
            <h5 className="mb-0">Shop Profile & Business Details</h5>
          </div>
          <div className="card-body p-4">
            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Shop / Business Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shop_name"
                    value={form.shop_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Darshan Electronics & Retail"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">State (Place of Supply) *</label>
                  <select
                    className="form-select"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="form-text">Used to compute CGST+SGST vs IGST automatically.</div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Address *</label>
                  <textarea
                    className="form-control"
                    name="address"
                    rows="2"
                    value={form.address || ''}
                    onChange={handleChange}
                    placeholder="Full shop address including PIN code"
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Shop GSTIN (Optional)</label>
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    name="gstin"
                    value={form.gstin || ''}
                    onChange={handleChange}
                    placeholder="24AAACD1234E1Z5"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Invoice Number Prefix</label>
                  <input
                    type="text"
                    className="form-control"
                    name="invoice_prefix"
                    value={form.invoice_prefix || 'INV-'}
                    onChange={handleChange}
                    placeholder="e.g. INV-, BILL-"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone / Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email || ''}
                    onChange={handleChange}
                    placeholder="shop@example.com"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Shop Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
