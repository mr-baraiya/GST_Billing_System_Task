import { useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '../components/NavbarPublic';
import FooterPublic from '../components/FooterPublic';

export default function LandingPage() {
  // Live GST Calculator State for Interactive Demo Widget
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [isInterState, setIsInterState] = useState(false);

  const taxAmount = (amount * gstRate) / 100;
  const grandTotal = amount + taxAmount;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavbarPublic />

      {/* Hero Section */}
      <section className="bg-dark text-white py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e1c36 0%, #172d54 100%)' }}>
        <div className="container py-lg-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-stars me-1"></i> Next-Gen GST Accounting Software
              </span>
              <h1 className="display-4 fw-black text-white mb-3 lh-tight">
                Effortless GST Billing & Inventory for <span className="text-primary">Growing Retailers</span>
              </h1>
              <p className="lead text-slate-300 mb-4 fw-normal opacity-90">
                Generate A4 GST tax invoices in seconds, track party ledger balances, automate email invoicing, and monitor financial analytics with ease.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-3 fw-bold shadow-lg rounded-pill">
                  Start 14-Day Free Trial <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/features" className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-pill">
                  Explore All Features
                </Link>
              </div>
              <div className="d-flex align-items-center gap-4 text-slate-400 small pt-2">
                <div><i className="bi bi-shield-check text-success me-1"></i> No Credit Card Required</div>
                <div><i className="bi bi-lightning-charge text-warning me-1"></i> Setup in 2 Minutes</div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-2xl border-0 rounded-4 overflow-hidden bg-slate-900 text-white p-2">
                <div className="bg-slate-800 p-3 rounded-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger rounded-circle p-1"></span>
                    <span className="badge bg-warning rounded-circle p-1"></span>
                    <span className="badge bg-success rounded-circle p-1"></span>
                    <span className="small text-slate-400 ms-2 font-monospace">gstkhata.app/dashboard</span>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success small">Live System</span>
                </div>
                <div className="p-4 bg-white text-dark rounded-bottom-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-receipt text-primary me-2"></i>Sample Invoice Preview</h6>
                    <span className="badge bg-primary">INV-1008</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-borderless text-sm mb-3">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Samsung 55" QLED TV</td>
                          <td>1</td>
                          <td>₹45,000</td>
                          <td className="text-end fw-semibold">₹45,000</td>
                        </tr>
                        <tr>
                          <td>Daikin 1.5T AC</td>
                          <td>1</td>
                          <td>₹38,000</td>
                          <td className="text-end fw-semibold">₹38,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-light p-3 rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted">GST (18% CGST+SGST)</div>
                      <div className="fw-bold text-dark">₹14,940.00</div>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">Grand Total</div>
                      <div className="fw-bold text-success fs-5">₹97,940.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Band */}
      <section className="bg-primary text-white py-4 shadow-sm">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3 col-6">
              <h2 className="fw-black mb-0">15,000+</h2>
              <div className="small opacity-85">Invoices Generated</div>
            </div>
            <div className="col-md-3 col-6">
              <h2 className="fw-black mb-0">₹100Cr+</h2>
              <div className="small opacity-85">GST Billing Managed</div>
            </div>
            <div className="col-md-3 col-6">
              <h2 className="fw-black mb-0">99.9%</h2>
              <div className="small opacity-85">Cloud Server Uptime</div>
            </div>
            <div className="col-md-3 col-6">
              <h2 className="fw-black mb-0">100%</h2>
              <div className="small opacity-85">Government GST Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section className="py-5 bg-white">
        <div className="container py-lg-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small tracking-wide">Powerful Features</span>
            <h2 className="fw-black display-6 mt-1 mb-3">Everything You Need To Run Your Retail Business</h2>
            <p className="text-muted">Designed for Indian business owners to save hours on invoicing, tax compliance, and customer billing.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-primary-subtle text-primary rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-receipt-cutoff fs-4"></i>
                </div>
                <h5 className="fw-bold">Smart Tax Split</h5>
                <p className="text-muted small">Auto-detects intra-state vs inter-state supply to apply CGST + SGST or IGST automatically.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-success-subtle text-success rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-envelope-paper fs-4"></i>
                </div>
                <h5 className="fw-bold">Direct Email Invoicing</h5>
                <p className="text-muted small">Send official PDF Tax Invoices to customers in 1-click via Nodemailer SMTP Integration.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-warning-subtle text-warning-emphasis rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-graph-up-arrow fs-4"></i>
                </div>
                <h5 className="fw-bold">Interactive Analytics</h5>
                <p className="text-muted small">Track monthly sales trends, tax collection breakdown, and top revenue electronics products.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-info-subtle text-info-emphasis rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-boxes fs-4"></i>
                </div>
                <h5 className="fw-bold">Product Catalog & HSN</h5>
                <p className="text-muted small">Maintain item stock rates, standard GST slabs (0%, 5%, 12%, 18%, 28%), and HSN/SAC codes.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-danger-subtle text-danger rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-people fs-4"></i>
                </div>
                <h5 className="fw-bold">Party Ledger Directory</h5>
                <p className="text-muted small">Track customer GSTIN numbers, billing addresses, and historical invoice ledgers instantly.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border shadow-sm hover-shadow transition">
                <div className="bg-purple-subtle text-purple rounded-3 p-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-shield-lock fs-4"></i>
                </div>
                <h5 className="fw-bold">Role-Based Staff Access</h5>
                <p className="text-muted small">Assign Owner, Admin, and Billing Operator roles with secure JWT permission controls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive GST Calculator Demo Widget */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container py-lg-3">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <span className="badge bg-success-subtle text-success border border-success px-3 py-1.5 rounded-pill fw-semibold mb-2">
                Live Interactive Tool
              </span>
              <h3 className="fw-black mb-3">Instant GST Tax Calculator</h3>
              <p className="text-muted">
                Test how GSTKhata calculates exact CGST, SGST, and IGST tax splits for your sales items in real time.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> Intra-State: 50% CGST + 50% SGST</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> Inter-State: 100% IGST</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> Supports standard slabs (5%, 12%, 18%, 28%)</li>
              </ul>
            </div>

            <div className="col-lg-7">
              <div className="card shadow border-0 p-4 bg-white rounded-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-calculator text-primary me-2"></i>Calculate GST On Sales</h5>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Taxable Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">GST Rate Slab (%)</label>
                    <select
                      className="form-select"
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                    >
                      <option value={5}>5% GST (Essential Goods)</option>
                      <option value={12}>12% GST (Standard Rate)</option>
                      <option value={18}>18% GST (Electronics & IT)</option>
                      <option value={28}>28% GST (Luxury Items)</option>
                    </select>
                  </div>
                </div>

                <div className="form-check form-switch mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="stateSwitch"
                    checked={isInterState}
                    onChange={(e) => setIsInterState(e.target.checked)}
                  />
                  <label className="form-check-input-label fw-semibold small" htmlFor="stateSwitch">
                    Inter-State Supply (Outside Home State - Apply IGST)
                  </label>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <div className="row text-center g-2">
                    <div className="col-4">
                      <div className="small text-muted">Taxable Value</div>
                      <div className="fw-bold">₹{amount.toFixed(2)}</div>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">{isInterState ? 'IGST Amount' : 'CGST + SGST'}</div>
                      <div className="fw-bold text-danger">₹{taxAmount.toFixed(2)}</div>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">Grand Total</div>
                      <div className="fw-bold text-success">₹{grandTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white py-5 mt-auto" style={{ background: 'linear-gradient(135deg, #172d54 0%, #0e1c36 100%)' }}>
        <div className="container text-center py-4">
          <h2 className="display-6 fw-black mb-3">Ready to Upgrade Your Retail Billing?</h2>
          <p className="lead text-slate-300 mb-4 max-w-xl mx-auto">
            Join thousands of Indian shop owners streamlining their GST invoices and financial ledger reports today.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg">
            Create Free Account Now <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

      <FooterPublic />
    </div>
  );
}
