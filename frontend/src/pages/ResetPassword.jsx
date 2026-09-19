import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      return setError('Invalid or missing password reset token');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <img src="/gstkhata_logo.png" alt="GSTKhata Logo" className="img-fluid mb-2" style={{ maxHeight: '55px' }} />
          <h4 className="fw-bold text-dark mb-1">Set New Password</h4>
          <p className="text-muted small">Enter and confirm your new GSTKhata account password</p>
        </div>

        {message && <div className="alert alert-success py-2 small">{message} Redirecting to login...</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {!message ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">New Password *</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Confirm New Password *</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        ) : null}

        <div className="text-center small text-muted">
          <Link to="/login" className="fw-bold text-primary text-decoration-none">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
