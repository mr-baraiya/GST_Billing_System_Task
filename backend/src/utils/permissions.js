const PERMISSION_KEYS = [
  'dashboard',
  'parties',
  'items',
  'create_bill',
  'bills_history',
  'delete_bill',
  'reports',
  'manage_staff',
  'shop_settings',
];

const DEFAULT_ROLE_PERMISSIONS = {
  Owner: [
    'dashboard',
    'parties',
    'items',
    'create_bill',
    'bills_history',
    'delete_bill',
    'reports',
    'manage_staff',
    'shop_settings',
  ],
  Manager: [
    'dashboard',
    'parties',
    'items',
    'create_bill',
    'bills_history',
    'delete_bill',
    'reports',
    'manage_staff',
  ],
  'Billing Staff': [
    'dashboard',
    'parties',
    'items',
    'create_bill',
    'bills_history',
  ],
  Accountant: [
    'dashboard',
    'parties',
    'items',
    'bills_history',
    'reports',
  ],
  'Sales Staff': [
    'dashboard',
    'parties',
    'items',
    'create_bill',
    'bills_history',
  ],
};

/**
  Returns permission array for a given role or custom permissions
 */
function getPermissionsForRole(role, customPermissions = null) {
  if (role === 'Owner') {
    return DEFAULT_ROLE_PERMISSIONS.Owner;
  }

  let perms = customPermissions;
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch (e) {
      perms = null;
    }
  }

  if (Array.isArray(perms)) {
    return perms;
  }

  return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS['Billing Staff'];
}

/**
 * Checks if user has a specific permission key
 */
function userHasPermission(user, permissionKey) {
  if (!user) return false;
  if (user.role === 'Owner') return true;
  if (user.status && user.status !== 'active') return false;

  const permissions = getPermissionsForRole(user.role, user.permissions);
  return permissions.includes(permissionKey);
}

module.exports = {
  PERMISSION_KEYS,
  DEFAULT_ROLE_PERMISSIONS,
  getPermissionsForRole,
  userHasPermission,
};
