import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

import Validator from '../utils/validator';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const PERMISSION_CONFIG = [
  { key: 'dashboard', label: 'Dashboard Overview', desc: 'Access sales metrics & dashboard widgets' },
  { key: 'parties', label: 'Parties Directory', desc: 'Create, edit & view customer records' },
  { key: 'items', label: 'Item Master Catalog', desc: 'Manage products & GST tax slabs' },
  { key: 'create_bill', label: 'Create GST Invoices', desc: 'Draft & generate tax invoices' },
  { key: 'bills_history', label: 'Invoices History', desc: 'Search & view generated billing history' },
  { key: 'delete_bill', label: 'Delete / Cancel Bills', desc: 'Remove or cancel completed invoices' },
  { key: 'reports', label: 'Reports & Export', desc: 'Access sales reports & export CSV data' },
  { key: 'manage_staff', label: 'Manage Staff & Roles', desc: 'Add staff accounts & assign permissions' },
  { key: 'shop_settings', label: 'Business Settings', desc: 'Configure shop profile & GSTIN' },
];

const DEFAULT_ROLE_PRESETS = {
  Owner: ['dashboard', 'parties', 'items', 'create_bill', 'bills_history', 'delete_bill', 'reports', 'manage_staff', 'shop_settings'],
  Manager: ['dashboard', 'parties', 'items', 'create_bill', 'bills_history', 'delete_bill', 'reports', 'manage_staff'],
  'Billing Staff': ['dashboard', 'parties', 'items', 'create_bill', 'bills_history'],
  Accountant: ['dashboard', 'parties', 'items', 'bills_history', 'reports'],
  'Sales Staff': ['dashboard', 'parties', 'items', 'create_bill', 'bills_history'],
};

export default function StaffManagement() {
  const { user: currentUser, hasPermission } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Deactivate Modal State
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    profile_picture: '',
    role: 'Billing Staff',
    permissions: DEFAULT_ROLE_PRESETS['Billing Staff'],
  });
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setStaffList(res.data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      mobile: '',
      profile_picture: '',
      role: 'Billing Staff',
      permissions: DEFAULT_ROLE_PRESETS['Billing Staff'],
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    const staffPerms = Array.isArray(staff.permissions)
      ? staff.permissions
      : DEFAULT_ROLE_PRESETS[staff.role] || [];

    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      password: '',
      mobile: staff.mobile || '',
      profile_picture: staff.profile_picture || '',
      role: staff.role || 'Billing Staff',
      permissions: staffPerms,
    });
    setFormMsg({ type: '', text: '' });
    setShowModal(true);
  };

  const handleRoleChange = (selectedRole) => {
    let presetPerms = DEFAULT_ROLE_PRESETS[selectedRole] || formData.permissions;
    setFormData({
      ...formData,
      role: selectedRole,
      permissions: presetPerms,
    });
  };

  const handlePermissionToggle = (permKey) => {
    if (formData.role === 'Owner') return; // Owner gets all permissions by default
    const exists = formData.permissions.includes(permKey);
    const updated = exists
      ? formData.permissions.filter((p) => p !== permKey)
      : [...formData.permissions, permKey];

    setFormData({
      ...formData,
      permissions: updated,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return setFormMsg({ type: 'danger', text: 'Image file size must be under 2MB' });
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profile_picture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    // Validator check
    const validation = Validator.validate(formData, {
      name: { required: true, label: 'Full Name' },
      email: { required: true, email: true, label: 'Email Address' },
      mobile: { mobile: true, label: 'Mobile Number' },
      ...(editingStaff ? {} : { password: { required: true, minLength: 6, label: 'Password' } }),
    });

    if (!validation.isValid) {
      return setFormMsg({ type: 'danger', text: Object.values(validation.errors)[0] });
    }

    setSubmitting(true);
    try {
      if (editingStaff) {
        await api.put(`/users/${editingStaff.id}`, formData);
      } else {
        await api.post('/users', formData);
      }

      setShowModal(false);
      fetchStaffList();
    } catch (err) {
      setFormMsg({ type: 'danger', text: err.response?.data?.error || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!deactivateTarget) return;
    setStatusLoading(true);
    try {
      await api.put(`/users/${deactivateTarget.id}/toggle-status`);
      setDeactivateTarget(null);
      fetchStaffList();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Filtering
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.mobile && s.mobile.includes(searchTerm));
    const matchesRole = !roleFilter || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Owner': return 'bg-dark text-white border border-secondary';
      case 'Manager': return 'bg-primary text-white';
      case 'Billing Staff': return 'bg-info bg-opacity-25 text-info border border-info border-opacity-25';
      case 'Accountant': return 'bg-warning bg-opacity-25 text-warning-emphasis border border-warning border-opacity-25';
      case 'Sales Staff': return 'bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-25';
      default: return 'bg-light text-dark border';
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-people-fill text-primary me-2"></i>Staff & Role Management
          </h4>
          <p className="text-muted small mb-0">
            Create staff accounts, assign business roles, and configure granular permissions
          </p>
        </div>

        {hasPermission('manage_staff') && (
          <button className="btn btn-primary btn-sm px-3 shadow-sm rounded-pill" onClick={handleOpenAddModal}>
            <i className="bi bi-person-plus-fill me-1"></i> Add Staff Member
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search staff by name, email or mobile..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select bg-light"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Business Roles</option>
                <option value="Owner">Owner / Admin</option>
                <option value="Manager">Manager</option>
                <option value="Billing Staff">Billing Staff</option>
                <option value="Accountant">Accountant</option>
                <option value="Sales Staff">Sales Staff</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => { setSearchTerm(''); setRoleFilter(''); setCurrentPage(1); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Members Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted small mt-2">Loading staff accounts...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-person-badge fs-1 text-muted"></i>
              <p className="fw-semibold text-dark mt-2">No staff accounts found</p>
              <p className="text-muted small">Try adjusting your search criteria or add a new staff member</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Staff Member</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Permissions Granted</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStaff.map((staff) => {
                    const permList = Array.isArray(staff.permissions)
                      ? staff.permissions
                      : DEFAULT_ROLE_PRESETS[staff.role] || [];

                    return (
                      <tr key={staff.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-dark text-white fw-bold d-flex align-items-center justify-content-center me-3 shadow-sm"
                              style={{ width: '40px', height: '40px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)' }}
                            >
                              {staff.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{staff.name}</div>
                              <div className="text-muted small">{staff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {staff.mobile ? (
                            <span className="small text-dark font-monospace">{staff.mobile}</span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          <span className="fw-bold text-dark">
                            {staff.role || 'Staff'}
                          </span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '380px' }}>
                            {staff.role === 'Owner' ? (
                              <span className="text-success fw-semibold small">
                                <i className="bi bi-shield-check me-1"></i>All Permissions (Full Admin)
                              </span>
                            ) : (
                              <span className="text-secondary small leading-normal">
                                {permList.map((p) => {
                                  const cfg = PERMISSION_CONFIG.find((c) => c.key === p);
                                  return cfg ? cfg.label : p;
                                }).join(', ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {staff.status === 'active' ? (
                            <span className="text-success fw-semibold small">
                              <i className="bi bi-check-circle-fill me-1"></i>Active
                            </span>
                          ) : (
                            <span className="text-danger fw-semibold small">
                              <i className="bi bi-dash-circle-fill me-1"></i>Inactive
                            </span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex align-items-center">
                            <button
                              className="text-primary fs-5 p-1 me-2 border-0 bg-transparent"
                              title="Edit Staff Account"
                              onClick={() => handleOpenEditModal(staff)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>

                            {staff.role !== 'Owner' && (
                              <button
                                className={`fs-5 p-1 border-0 bg-transparent ${staff.status === 'active' ? 'text-danger' : 'text-success'}`}
                                title={staff.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                                onClick={() => setDeactivateTarget(staff)}
                              >
                                <i className={`bi ${staff.status === 'active' ? 'bi-person-x' : 'bi-person-check'}`}></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Component */}
          {filteredStaff.length > itemsPerPage && (
            <div className="p-3 border-top">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-gear me-2"></i>
                  {editingStaff ? 'Edit Staff Account & Permissions' : 'Create Staff Member Account'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {formMsg.text && <div className={`alert alert-${formMsg.type} py-2 small`}>{formMsg.text}</div>}

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="staff@example.com"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Mobile Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        {editingStaff ? 'New Password (leave blank to keep current)' : 'Account Password *'}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingStaff}
                        minLength="6"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold small">Profile Picture Avatar</label>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-dark text-white fw-bold d-flex align-items-center justify-content-center shadow-sm overflow-hidden flex-shrink-0"
                          style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)' }}
                        >
                          {formData.profile_picture ? (
                            <img src={formData.profile_picture} alt="Avatar Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                          ) : (
                            <span className="small">{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control form-control-sm mb-1"
                            onChange={handleFileChange}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.profile_picture || ''}
                            onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                            placeholder="Or paste Image URL (https://...)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold small">Assign Business Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        disabled={editingStaff?.role === 'Owner'}
                      >
                        <option value="Billing Staff">Billing Staff (Create Bills, View Catalog)</option>
                        <option value="Manager">Manager (Full operational access, no shop settings)</option>
                        <option value="Accountant">Accountant (View Invoices, Financial Reports)</option>
                        <option value="Sales Staff">Sales Staff (Create & Search Invoices)</option>
                        <option value="Custom">Custom Role (Select Custom Permissions Below)</option>
                        {editingStaff?.role === 'Owner' && <option value="Owner">Owner / Administrator</option>}
                      </select>
                    </div>
                  </div>

                  {/* Granular Permission Checklist */}
                  <div className="border rounded-3 p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">Granular Permission Matrix</h6>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {formData.role === 'Owner'
                            ? 'The Business Owner possesses full unrestricted system access.'
                            : 'Customize specific capability access for this staff member.'}
                        </small>
                      </div>
                      <span className="badge bg-primary">
                        {formData.permissions.length} / {PERMISSION_CONFIG.length} Enabled
                      </span>
                    </div>

                    <div className="row g-2">
                      {PERMISSION_CONFIG.map((perm) => {
                        const isChecked = formData.role === 'Owner' || formData.permissions.includes(perm.key);

                        return (
                          <div className="col-md-6" key={perm.key}>
                            <div className="card h-100 border p-2 bg-white">
                              <div className="form-check me-2">
                                <input
                                  className="form-check-input me-2"
                                  type="checkbox"
                                  id={`perm-${perm.key}`}
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(perm.key)}
                                  disabled={formData.role === 'Owner'}
                                />
                                <label className="form-check-label user-select-none" htmlFor={`perm-${perm.key}`}>
                                  <div className="fw-semibold text-dark small">{perm.label}</div>
                                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>{perm.desc}</div>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Delete / Status Toggle Confirmation Modal */}
      <DeleteConfirmModal
        show={Boolean(deactivateTarget)}
        title={deactivateTarget?.status === 'active' ? 'Deactivate Staff Account' : 'Activate Staff Account'}
        message={deactivateTarget?.status === 'active' ? 'Are you sure you want to deactivate this staff account?' : 'Re-activate access for this staff member?'}
        itemName={`${deactivateTarget?.name} (${deactivateTarget?.email})`}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setDeactivateTarget(null)}
        loading={statusLoading}
        confirmBtnText={deactivateTarget?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
      />
    </div>
  );
}
