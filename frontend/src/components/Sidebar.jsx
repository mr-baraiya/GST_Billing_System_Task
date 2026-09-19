import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ shopInfo }) {
  const { user, logout, hasPermission } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <img src="/gstkhata_icon.png" alt="GSTKhata Icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        <div className="brand-text">
          <h5 className="mb-0 fw-bold text-white" style={{ letterSpacing: '0.5px' }}>GSTKhata</h5>
          <small className="text-white-50" style={{ fontSize: '0.725rem' }}>Smart Retail & Billing</small>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <div className="menu-category">MAIN MENU</div>
        {hasPermission('dashboard') && (
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </NavLink>
        )}
        {hasPermission('create_bill') && (
          <NavLink to="/create-bill" className={({ isActive }) => `sidebar-link create-bill-action ${isActive ? 'active' : ''}`}>
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create GST Bill</span>
          </NavLink>
        )}
        {hasPermission('bills_history') && (
          <NavLink to="/bills" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-file-earmark-text-fill"></i>
            <span>Invoices History</span>
          </NavLink>
        )}

        {(hasPermission('parties') || hasPermission('items')) && (
          <div className="menu-category">MASTER CATALOG</div>
        )}
        {hasPermission('parties') && (
          <NavLink to="/parties" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-people-fill"></i>
            <span>Parties</span>
          </NavLink>
        )}
        {hasPermission('items') && (
          <NavLink to="/items" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-box-seam-fill"></i>
            <span>Item Catalog</span>
          </NavLink>
        )}

        {(hasPermission('manage_staff') || hasPermission('shop_settings')) && (
          <div className="menu-category">CONFIGURATION</div>
        )}
        {hasPermission('manage_staff') && (
          <NavLink to="/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-badge-fill"></i>
            <span>Staff</span>
          </NavLink>
        )}
        {hasPermission('shop_settings') && (
          <NavLink to="/shop-settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-gear-fill"></i>
            <span>Settings</span>
          </NavLink>
        )}
      </div>

      {/* Sidebar Footer / Profile & Shop Status */}
      <div className="sidebar-footer">
        {/* Logged in User Section */}
        {user && (
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-white border-opacity-10">
            <div className="text-truncate me-2">
              <div className="fw-bold text-white small text-truncate">
                <i className="bi bi-person-circle me-1 text-primary"></i>
                {user.name}
              </div>
              <div className="text-white-50 text-truncate" style={{ fontSize: '0.7rem' }}>
                {user.role || 'Owner'} • {user.email}
              </div>
            </div>
            <button
              className="text-danger p-1 border-0 bg-transparent"
              title="Logout Account"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        )}

        {/* Shop Location Section */}
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center me-2 text-truncate">
            <span className="status-indicator"></span>
            <span className="fw-semibold text-white small text-truncate">
              {shopInfo?.shop_name || 'Darshan Electronics'}
            </span>
          </div>
          <span className="text-info opacity-75 small text-nowrap">
            {shopInfo?.state || 'Gujarat'}
          </span>
        </div>
      </div>
    </aside>
  );
}
