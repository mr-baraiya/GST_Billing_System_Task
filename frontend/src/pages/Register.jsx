import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '440px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <img src="/gstkhata_logo.png" alt="GSTKhata Logo" className="img-fluid mb-2" style={{ maxHeight: '55px' }} />
          <p className="text-muted small">Register to start managing GST billing</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Full Name / Business Name *</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Doe / Acme Store"
              />
            </div>
          </div>

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
            <label className="form-label fw-semibold small">Password *</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Confirm Password *</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-shield-lock"></i></span>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating Account...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <div className="text-center small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-primary text-decoration-none">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
