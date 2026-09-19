import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'If an account exists with that email, a password reset link has been sent via email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div className="mb-2 text-start">
          <Link to="/" className="text-decoration-none text-muted small d-inline-flex align-items-center">
            <i className="bi bi-arrow-left me-1"></i> Back to Home
          </Link>
        </div>
        <div className="text-center mb-4">
          <Link to="/">
            <img src="/gstkhata_logo.png" alt="GSTKhata Logo" className="img-fluid mb-2" style={{ maxHeight: '55px' }} />
          </Link>
          <h4 className="fw-bold text-dark mb-1">Forgot Password?</h4>
          <p className="text-muted small">Enter your email and we'll send you a link to reset your GSTKhata password.</p>
        </div>

        {message && <div className="alert alert-success py-2 small">{message}</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {!message ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Registered Email Address *</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending Email...
                </>
              ) : (
                'Send Password Reset Link'
              )}
            </button>
          </form>
        ) : null}

        <div className="text-center small text-muted">
          Remembered your password?{' '}
          <Link to="/login" className="fw-bold text-primary text-decoration-none">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
