import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ shopInfo }) {
  const location = useLocation();
  const { user, logout, updateProfile, changePassword, hasPermission } = useAuth();

  // Dropdown & Modal States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    profile_picture: user?.profile_picture || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return { title: 'Dashboard Overview', subtitle: 'Track overall sales, tax collection, and recent invoices' };
      case '/create-bill': return { title: 'Create GST Invoice', subtitle: 'Itemized billing with automatic CGST, SGST & IGST split' };
      case '/bills': return { title: 'Invoices History', subtitle: 'Search, filter, and export generated billing records' };
      case '/parties': return { title: 'Parties Directory', subtitle: 'Manage customer accounts and view single party billing history' };
      case '/items': return { title: 'Product Catalog', subtitle: 'Reusable item master list with standard GST tax slabs' };
      case '/staff': return { title: 'Staff & Role Management', subtitle: 'Manage staff accounts, assign business roles, and configure permissions' };
      case '/shop-settings': return { title: 'Shop Profile Settings', subtitle: 'Configure business details, GSTIN, and place of supply' };
      default:
        if (location.pathname.startsWith('/bills/')) {
          return { title: 'Tax Invoice Detail View', subtitle: 'Immutable tax invoice document summary, PDF & export' };
        }
        return { title: 'GSTKhata Billing System', subtitle: 'Darshan University Practical Task' };
    }
  };

  const page = getPageTitle();

  const handleOpenProfileModal = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      profile_picture: user?.profile_picture || '',
    });
    setProfileMsg({ type: '', text: '' });
    setShowDropdown(false);
    setShowProfileModal(true);
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMsg({ type: '', text: '' });
    setShowDropdown(false);
    setShowPasswordModal(true);
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      await updateProfile(profileForm.name, profileForm.email, profileForm.mobile, profileForm.profile_picture);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setShowProfileModal(false), 1500);
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ type: 'danger', text: 'New passwords do not match' });
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters long' });
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = reject;
          img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProfileForm((prev) => ({ ...prev, profile_picture: compressedDataUrl }));
    } catch (err) {
      console.error('Image compression error:', err);
      setProfileMsg({ type: 'danger', text: 'Failed to process selected image' });
    }
  };

  return (
    <header className="top-header">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-0 text-dark">{page.title}</h4>
          <small className="text-muted">{page.subtitle}</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Shop Info (Clean text without box wrapper) */}
          <div className="d-none d-lg-block text-end me-1">
            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem', maxWidth: '220px' }}>
              {shopInfo?.shop_name || 'Darshan Electronics & Retail'}
            </div>
            <div className="text-secondary text-nowrap" style={{ fontSize: '0.75rem' }}>
              GSTIN: <span className="font-monospace fw-semibold text-primary">{shopInfo?.gstin || '24AAACD1234E1Z5'}</span>
            </div>
          </div>

          <div className="vr d-none d-lg-block my-1 opacity-25" style={{ height: '28px' }}></div>

          {hasPermission('create_bill') && (
            <Link to="/create-bill" className="btn btn-primary btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1 fw-semibold">
              <i className="bi bi-plus-lg fs-6"></i>
              <span>New Bill</span>
            </Link>
          )}

          {/* User Profile Avatar Dropdown */}
          {user && (
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm profile-avatar-btn"
                style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)', border: '2px solid #ffffff' }}
                onClick={() => setShowDropdown(!showDropdown)}
                title="User Profile & Settings"
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="rounded-circle w-100 h-100" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="fw-bold text-white small">{getInitials(user.name)}</span>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div
                    className="position-absolute end-0 mt-2 shadow-lg bg-white rounded-3 py-2 border"
                    style={{ width: '250px', zIndex: 1050 }}
                  >
                    <div className="px-3 py-2 border-bottom bg-light">
                      <div className="fw-bold text-dark text-truncate">{user.name}</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style={{ fontSize: '0.65rem' }}>
                        <i className="bi bi-shield-lock me-1"></i>{user.role || 'Owner'}
                      </span>
                    </div>

                    <button
                      className="dropdown-item d-flex align-items-center py-2 px-3 small text-dark"
                      onClick={handleOpenProfileModal}
                    >
                      <i className="bi bi-person-gear me-2 text-primary fs-6"></i>
                      <span>Profile</span>
                    </button>

                    <button
                      className="dropdown-item d-flex align-items-center py-2 px-3 small text-dark"
                      onClick={handleOpenPasswordModal}
                    >
                      <i className="bi bi-key me-2 text-warning fs-6"></i>
                      <span>Change Password</span>
                    </button>

                    <div className="dropdown-divider my-1"></div>

                    <button
                      className="dropdown-item d-flex align-items-center py-2 px-3 small text-danger"
                      onClick={() => { setShowDropdown(false); logout(); }}
                    >
                      <i className="bi bi-box-arrow-right me-2 fs-6"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title"><i className="bi bi-person-gear me-2"></i>Profile Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfileModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateProfileSubmit}>
                <div className="modal-body">
                  {profileMsg.text && <div className={`alert alert-${profileMsg.type} py-2 small`}>{profileMsg.text}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Profile Picture Avatar</label>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div
                        className="rounded-circle bg-dark text-white fw-bold d-flex align-items-center justify-content-center shadow-sm overflow-hidden flex-shrink-0"
                        style={{ width: '54px', height: '54px', background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)' }}
                      >
                        {profileForm.profile_picture ? (
                          <img src={profileForm.profile_picture} alt="Avatar Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className="fs-5">{getInitials(profileForm.name)}</span>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm mb-1"
                          onChange={handleFileChange}
                        />
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Upload image file from device (PNG, JPG, WEBP) or paste URL below
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={profileForm.profile_picture || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, profile_picture: e.target.value })}
                      placeholder="Or paste Image URL (https://...)"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title"><i className="bi bi-key me-2"></i>Change Password</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <form onSubmit={handleChangePasswordSubmit}>
                <div className="modal-body">
                  {passwordMsg.text && <div className={`alert alert-${passwordMsg.type} py-2 small`}>{passwordMsg.text}</div>}
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Old / Current Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      required
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength="6"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Confirm New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-semibold" disabled={savingPassword}>
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
