import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Validator from '../utils/validator';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Reusable Validator check
    const validation = Validator.validate({ email, password }, {
      email: { required: true, email: true, label: 'Email Address' },
      password: { required: true, label: 'Password' },
    });

    if (!validation.isValid) {
      setSubmitting(false);
      return setError(Object.values(validation.errors)[0]);
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <img src="/gstkhata_logo.png" alt="GSTKhata Logo" className="img-fluid mb-2" style={{ maxHeight: '55px' }} />
          <p className="text-muted small">Sign in to manage invoices, parties & catalog</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email Address *</label>
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

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold small mb-0">Password *</label>
              <Link to="/forgot-password" className="small text-primary text-decoration-none">Forgot Password?</Link>
            </div>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="fw-bold text-primary text-decoration-none">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
