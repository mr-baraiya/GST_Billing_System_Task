import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavbarPublic() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active text-primary fw-bold' : 'text-dark';

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-white border-bottom shadow-sm py-3">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark fs-4">
          <img src="/gstkhata_icon.png" alt="GSTKhata Logo" style={{ height: '38px', width: '38px', objectFit: 'contain' }} />
          <span className="tracking-tight">GST<span className="text-primary">Khata</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicNavbar"
          aria-controls="publicNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="publicNavbar">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold gap-lg-3">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/features" className={`nav-link ${isActive('/features')}`}>Features</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-link ${isActive('/about')}`}>About Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>Contact Us</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-pill">
                <i className="bi bi-speedometer2 me-1"></i> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary px-3 py-2 fw-bold rounded-pill">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-pill">
                  Start Free Trial <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
