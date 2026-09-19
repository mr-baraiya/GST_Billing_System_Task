import { Link } from 'react-router-dom';
import NavbarPublic from '../components/NavbarPublic';
import FooterPublic from '../components/FooterPublic';

export default function FeaturesPage() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavbarPublic />

      {/* Hero Banner */}
      <section className="bg-dark text-white py-5" style={{ background: 'linear-gradient(135deg, #0e1c36 0%, #172d54 100%)' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1.5 rounded-pill fw-semibold mb-3">
            Product Capabilities
          </span>
          <h1 className="display-5 fw-black text-white mb-3">
            Comprehensive GST Billing Features
          </h1>
          <p className="lead text-slate-300 max-w-2xl mx-auto opacity-90">
            Discover how GSTKhata empowers Indian electronics retailers, wholesalers, and service providers with cutting-edge billing and inventory automation.
          </p>
        </div>
      </section>

      {/* Feature Section 1: GST Compliance */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="p-3 bg-primary-subtle rounded-4 text-primary d-inline-flex mb-3">
                <i className="bi bi-shield-check fs-2"></i>
              </div>
              <h2 className="fw-black mb-3">100% Government GST Compliant</h2>
              <p className="text-muted leading-relaxed">
                GSTKhata automatically enforces government tax rules for all Indian states. When billing a customer, the system checks whether the transaction is within your state or across state borders:
              </p>
              <ul className="list-unstyled text-muted d-flex flex-column gap-2 mb-4">
                <li><i className="bi bi-check-circle-fill text-primary me-2"></i> <strong>Intra-State Sale:</strong> Automatically splits total tax into 50% CGST and 50% SGST.</li>
                <li><i className="bi bi-check-circle-fill text-primary me-2"></i> <strong>Inter-State Sale:</strong> Applies 100% IGST seamlessly.</li>
                <li><i className="bi bi-check-circle-fill text-primary me-2"></i> <strong>Standard Slabs:</strong> Full support for 0%, 5%, 12%, 18%, and 28% GST categories.</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border p-4 bg-light rounded-4">
                <h6 className="fw-bold border-bottom pb-2 mb-3"><i className="bi bi-diagram-3 me-2 text-primary"></i>Tax Calculation Rule Logic</h6>
                <div className="bg-white p-3 rounded border mb-2">
                  <div className="d-flex justify-content-between text-sm">
                    <span>Gujarat to Gujarat Sale (Taxable ₹10,000 @ 18%)</span>
                    <span className="fw-bold text-success">CGST ₹900 + SGST ₹900</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="d-flex justify-content-between text-sm">
                    <span>Gujarat to Maharashtra Sale (Taxable ₹10,000 @ 18%)</span>
                    <span className="fw-bold text-primary">IGST ₹1,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: PDF & Email */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-5 flex-lg-row-reverse">
            <div className="col-lg-6">
              <div className="p-3 bg-success-subtle rounded-4 text-success d-inline-flex mb-3">
                <i className="bi bi-file-earmark-pdf fs-2"></i>
              </div>
              <h2 className="fw-black mb-3">Instant A4 PDF & Email Dispatch</h2>
              <p className="text-muted leading-relaxed">
                Generate clean, print-ready A4 GST Tax Invoices powered by PDFKit engine. Directly email official invoices with PDF attachments to customer email addresses in a single click.
              </p>
              <ul className="list-unstyled text-muted d-flex flex-column gap-2 mb-4">
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> High-resolution A4 tax invoice layout with business logo & signature.</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> Instant Nodemailer integration for automatic email delivery.</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i> Thermal & standard A4 printer support.</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border p-4 bg-white rounded-4 text-center">
                <i className="bi bi-envelope-check text-success display-1 mb-3"></i>
                <h5 className="fw-bold">1-Click Invoice Emailing</h5>
                <p className="text-muted small">Customers receive official HTML email with PDF invoice attachment instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Analytics & Staff Roles */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 p-4 border shadow-sm rounded-4">
                <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-pie-chart fs-3"></i>
                </div>
                <h4 className="fw-bold">Real-Time Financial Charts</h4>
                <p className="text-muted">Interactive Chart.js visualizations tracking sales revenue curves, tax liability breakdowns, and payment status ratios (Paid vs Unpaid vs Partial).</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 p-4 border shadow-sm rounded-4">
                <div className="p-3 bg-danger-subtle text-danger rounded-3 d-inline-flex mb-3" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-person-gear fs-3"></i>
                </div>
                <h4 className="fw-bold">Multi-Staff Permissions</h4>
                <p className="text-muted">Create staff accounts for your billing operators and store managers with role-based access restrictions to safeguard sensitive business settings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-dark text-white py-5 mt-auto" style={{ background: 'linear-gradient(135deg, #172d54 0%, #0e1c36 100%)' }}>
        <div className="container text-center py-3">
          <h3 className="fw-black mb-3">Experience the Full Feature Suite</h3>
          <Link to="/register" className="btn btn-primary btn-lg px-4 py-2.5 fw-bold rounded-pill">
            Get Started Today
          </Link>
        </div>
      </section>

      <FooterPublic />
    </div>
  );
}
