import { Link } from 'react-router-dom';

export default function FooterPublic() {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                <i className="bi bi-receipt"></i>
              </div>
              <span className="fw-bold fs-4 text-white">GST<span className="text-primary">Khata</span></span>
            </div>
            <p className="text-muted small leading-relaxed">
              India's premier cloud GST Billing, Inventory Management, and Tax Invoicing software built specifically for retail shops, electronics distributors, and growing enterprises.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-secondary">GST Compliant</span>
              <span className="badge bg-success">100% Safe & Secure</span>
              <span className="badge bg-primary">Cloud Sync</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3">Quick Navigation</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><Link to="/" className="text-muted text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/features" className="text-muted text-decoration-none hover-white">Core Features</Link></li>
              <li><Link to="/about" className="text-muted text-decoration-none hover-white">About Us</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none hover-white">Contact & Support</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none hover-white">Staff Login</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Product Capabilities</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><i className="bi bi-check2 text-success me-1"></i> Multi-Item GST Invoicing</li>
              <li><i className="bi bi-check2 text-success me-1"></i> Intra-State (CGST+SGST) & IGST</li>
              <li><i className="bi bi-check2 text-success me-1"></i> Automated Email Tax Invoices</li>
              <li><i className="bi bi-check2 text-success me-1"></i> HSN / SAC Code Library</li>
              <li><i className="bi bi-check2 text-success me-1"></i> CSV Financial Data Export</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Corporate Headquarters</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2">
              <li><i className="bi bi-geo-alt text-primary me-2"></i> 101 University Road, Rajkot, Gujarat - 360005</li>
              <li><i className="bi bi-telephone text-primary me-2"></i> +91 7383359679</li>
              <li><i className="bi bi-envelope text-primary me-2"></i> vvbaraiya32@gmail.com</li>
              <li><i className="bi bi-clock text-primary me-2"></i> Mon - Sat: 9:00 AM - 7:00 PM</li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-wrap justify-content-between align-items-center small text-muted">
          <div>© 2026 GSTKhata Billing System. All rights reserved.</div>
          <div className="d-flex gap-3">
            <a href="#privacy" className="text-muted text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-muted text-decoration-none">Terms of Service</a>
            <a href="#security" className="text-muted text-decoration-none">Data Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
