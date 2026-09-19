import { Link } from 'react-router-dom';
import NavbarPublic from '../components/NavbarPublic';
import FooterPublic from '../components/FooterPublic';

export default function AboutPage() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavbarPublic />

      {/* Hero Banner */}
      <section className="bg-dark text-white py-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1.5 rounded-pill fw-semibold mb-3">
            Our Mission & Story
          </span>
          <h1 className="display-5 fw-black text-white mb-3">
            Empowering Indian Retailers Through Tech
          </h1>
          <p className="lead text-slate-300 max-w-2xl mx-auto opacity-90">
            GSTKhata was built to make GST tax compliance, inventory cataloging, and invoice management simple, fast, and accessible for every store owner in India.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-5 bg-white">
        <div className="container py-lg-3">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-primary fw-bold text-uppercase small">Founded in Gujarat</span>
              <h2 className="fw-black mb-3">Built for Modern Businesses Across India</h2>
              <p className="text-muted leading-relaxed mb-3">
                Since the introduction of Goods and Services Tax (GST) in India, micro, small, and medium enterprises (MSMEs) have faced significant complexity managing tax slabs, state splits (CGST/SGST vs IGST), and HSN codes.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                <strong>GSTKhata</strong> eliminates manual math errors and cumbersome desktop software with a lightning-fast, web-based platform. Whether you operate a single electronics store or a multi-branch enterprise, our platform automates invoicing, email dispatch, and financial reporting.
              </p>
              <div className="row g-3 text-center">
                <div className="col-4 border-end">
                  <h3 className="fw-bold text-primary mb-0">100%</h3>
                  <div className="small text-muted">Accuracy Rate</div>
                </div>
                <div className="col-4 border-end">
                  <h3 className="fw-bold text-success mb-0">&lt;5 Sec</h3>
                  <div className="small text-muted">Invoice Speed</div>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold text-dark mb-0">24/7</h3>
                  <div className="small text-muted">Cloud Access</div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow border-0 p-4 bg-light rounded-4">
                <h4 className="fw-bold mb-3"><i className="bi bi-bullseye text-primary me-2"></i>Our Core Values</h4>
                <div className="d-flex gap-3 mb-3">
                  <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <i className="bi bi-lightning-charge fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Speed & Simplicity</h6>
                    <div className="small text-muted">Minimal clicks to generate, print, or email GST invoices to your customers.</div>
                  </div>
                </div>
                <div className="d-flex gap-3 mb-3">
                  <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <i className="bi bi-shield-check fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Uncompromising Security</h6>
                    <div className="small text-muted">Bank-grade encryption, secure PostgreSQL cloud hosting, and protected staff permissions.</div>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <div className="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <i className="bi bi-graph-up-arrow fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Actionable Intelligence</h6>
                    <div className="small text-muted">Real-time Chart.js dashboards to monitor sales, tax liabilities, and top revenue products.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white py-5 mt-auto" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="container text-center py-3">
          <h3 className="fw-black mb-3">Join Thousands of Businesses Scaling with GSTKhata</h3>
          <Link to="/register" className="btn btn-primary btn-lg px-4 py-2.5 fw-bold rounded-pill">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      <FooterPublic />
    </div>
  );
}
