import { useState } from 'react';
import api from '../api/axios';
import NavbarPublic from '../components/NavbarPublic';
import FooterPublic from '../components/FooterPublic';

import Validator from '../utils/validator';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Reusable Validator check
    const validation = Validator.validate(form, {
      name: { required: true, label: 'Full Name' },
      email: { required: true, email: true, label: 'Email Address' },
      phone: { mobile: true, label: 'Phone Number' },
      message: { required: true, label: 'Message' },
    });

    if (!validation.isValid) {
      setLoading(false);
      return setErrorMessage(Object.values(validation.errors)[0]);
    }

    try {
      const res = await api.post('/contact', form);
      setSuccessMessage(res.data.message || 'Thank you! Your message has been sent to our admin team.');
      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to send message. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <NavbarPublic />

      {/* Hero Banner */}
      <section className="bg-dark text-white py-5" style={{ background: 'linear-gradient(135deg, #0e1c36 0%, #172d54 100%)' }}>
        <div className="container py-4 text-center">
          <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1.5 rounded-pill fw-semibold mb-3">
            Contact & Customer Support
          </span>
          <h1 className="display-5 fw-black text-white mb-3">
            We'd Love to Hear From You
          </h1>
          <p className="lead text-slate-300 max-w-2xl mx-auto opacity-90">
            Have questions about GSTKhata features, pricing, or custom software integrations? Fill out the form below and our team will email you back shortly.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-5 bg-white">
        <div className="container py-lg-3">
          <div className="row g-5">
            {/* Contact Form Column */}
            <div className="col-lg-7">
              <div className="card shadow-sm border p-4 rounded-4">
                <h4 className="fw-bold mb-1"><i className="bi bi-send text-primary me-2"></i>Send Us a Message</h4>
                <p className="text-muted small mb-4">Submitting this form immediately notifies our admin team via email.</p>

                {successMessage && (
                  <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div>{successMessage}</div>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. ramesh@example.com"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Phone Number</label>
                      <input
                        className="form-control"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. +91 9876543210"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Subject / Inquiry Type</label>
                      <select
                        className="form-select"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Product Demo Request">Product Demo Request</option>
                        <option value="Sales & Billing Support">Sales & Billing Support</option>
                        <option value="Custom GST Integration">Custom GST Integration</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Your Message / Query *</label>
                      <textarea
                        className="form-control"
                        name="message"
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        required
                        placeholder="Describe your inquiry or requirement in detail..."
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 fw-bold shadow-sm rounded-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i> Submit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Info & Map Column */}
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-3 h-100">
                <div className="card shadow-sm border p-3 rounded-4 bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="bi bi-telephone fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Phone & WhatsApp</h6>
                      <div className="text-muted small">+91 7383359679</div>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border p-3 rounded-4 bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="bi bi-envelope fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Official Support Email</h6>
                      <div className="text-muted small">vvbaraiya32@gmail.com</div>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border p-3 rounded-4 bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-warning text-dark rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className="bi bi-geo-alt fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Corporate Office</h6>
                      <div className="text-muted small">101 University Road, Near Rajkot Highway, Rajkot, Gujarat - 360005</div>
                    </div>
                  </div>
                </div>

                {/* Map Embed Card */}
                <div className="card shadow-sm border rounded-4 overflow-hidden flex-grow-1">
                  <iframe
                    title="Rajkot Office Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118147.6820211904!2d70.7512555!3d22.3038945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959c98ac71cdf0f%3A0x76dd15cfbe93ad3b!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: 220 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterPublic />
    </div>
  );
}
