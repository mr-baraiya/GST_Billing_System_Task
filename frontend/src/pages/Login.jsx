import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Validator from '../utils/validator';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOtp, resendOtp } = useAuth();
  
  // Step 1 State: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2 State: 2FA OTP
  const [step, setStep] = useState(1); // 1 = Password, 2 = OTP
  const [otp, setOtp] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Timer countdown effect for Resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Submit Credentials & Request OTP
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendMessage('');
    setSubmitting(true);

    const validation = Validator.validate({ email, password }, {
      email: { required: true, email: true, label: 'Email Address' },
      password: { required: true, label: 'Password' },
    });

    if (!validation.isValid) {
      setSubmitting(false);
      return setError(Object.values(validation.errors)[0]);
    }

    try {
      const res = await login(email, password);
      if (res.requireOtp) {
        setStep(2);
        setResendTimer(30); // 30 second cooldown before resending
      } else {
        // Direct login if OTP requirement is bypassed
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendMessage('');

    if (!otp || otp.trim().length !== 6) {
      return setError('Please enter a valid 6-digit OTP code');
    }

    setSubmitting(true);
    try {
      await verifyOtp(email, otp.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired verification code');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setResendMessage('');
    setSubmitting(true);

    try {
      const res = await resendOtp(email);
      setResendMessage(res.message || 'A new OTP has been sent to your email.');
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '440px', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <img src="/gstkhata_logo.png" alt="GSTKhata Logo" className="img-fluid mb-2" style={{ maxHeight: '55px' }} />
          <h5 className="fw-bold mb-1">{step === 1 ? 'Welcome Back' : 'Two-Step Verification'}</h5>
          <p className="text-muted small mb-0">
            {step === 1
              ? 'Sign in to manage invoices, parties & catalog'
              : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {resendMessage && <div className="alert alert-success py-2 small">{resendMessage}</div>}

        {step === 1 ? (
          /* Step 1: Email & Password Form */
          <form onSubmit={handlePasswordSubmit}>
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

            <button type="submit" className="btn btn-primary w-100 py-2.5 fw-semibold mb-3 shadow-sm" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending OTP Code...
                </>
              ) : (
                <>
                  Continue <i className="bi bi-arrow-right me-1"></i>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 2-Step OTP Verification Form */
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-3 text-center">
              <label className="form-label fw-bold small text-uppercase text-secondary mb-2">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength="6"
                className="form-control text-center font-monospace fs-3 fw-bold tracking-widest py-2"
                style={{ letterSpacing: '0.5rem' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="______"
              />
              <div className="form-text small mt-2">
                Check your inbox & spam folder for the passcode
              </div>
            </div>

            <button type="submit" className="btn btn-success w-100 py-2.5 fw-bold mb-3 shadow-sm" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verifying OTP...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-1"></i> Verify OTP & Sign In
                </>
              )}
            </button>

            <div className="d-flex justify-content-between align-items-center small border-top pt-3">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                onClick={() => { setStep(1); setError(''); }}
              >
                <i className="bi bi-arrow-left me-1"></i> Change Email / Password
              </button>

              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || submitting}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="text-center small text-muted border-top pt-3 mt-1">
            Don't have an account?{' '}
            <Link to="/register" className="fw-bold text-primary text-decoration-none">Create Account</Link>
          </div>
        )}
      </div>
    </div>
  );
}
