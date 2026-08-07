const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const jsonRolesPath = path.join(dataDir, 'roles_store.json');

// Built-in default permissions reference catalog
const ALL_PERMISSIONS = [
  { key: 'dashboard.view', name: 'View Dashboard', category: 'General' },
  { key: 'users.view', name: 'View Users List', category: 'User Management' },
  { key: 'users.create', name: 'Create Users', category: 'User Management' },
  { key: 'users.edit', name: 'Edit Users', category: 'User Management' },
  { key: 'users.delete', name: 'Delete Users', category: 'User Management' },
  { key: 'roles.manage', name: 'Manage Roles & Permissions', category: 'System Administration' },
  { key: 'reports.view', name: 'View & Create Reports', category: 'Reports & Files' },
  { key: 'files.upload', name: 'Upload & Manage Files', category: 'Reports & Files' },
];

const INITIAL_ROLES = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access and authority to manage all users and roles.',
    permissions: ALL_PERMISSIONS.map(p => p.key),
    is_system: true,
    color: '#6366f1'
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can view dashboard, edit user details, upload files, and manage content.',
    permissions: ['dashboard.view', 'users.view', 'users.edit', 'reports.view', 'files.upload'],
    is_system: true,
    color: '#06b6d4'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboard and user directory.',
    permissions: ['dashboard.view', 'users.view'],
    is_system: true,
    color: '#64748b'
  }
];

function getJsonRoles() {
  if (!fs.existsSync(jsonRolesPath)) {
    fs.writeFileSync(jsonRolesPath, JSON.stringify(INITIAL_ROLES, null, 2));
    return [...INITIAL_ROLES];
  }
  try {
    const raw = fs.readFileSync(jsonRolesPath, 'utf8');
    const roles = JSON.parse(raw);
    return Array.isArray(roles) && roles.length > 0 ? roles : [...INITIAL_ROLES];
  } catch (e) {
    return [...INITIAL_ROLES];
  }
}

function saveJsonRoles(roles) {
  try {
    fs.writeFileSync(jsonRolesPath, JSON.stringify(roles, null, 2));
  } catch (e) {
    console.error("Error saving JSON roles:", e);
  }
}

const getAllRoles = async () => {
  return getJsonRoles();
};

const getRoleByIdOrName = async (identifier) => {
  const roles = getJsonRoles();
  const lower = String(identifier).toLowerCase();
  return roles.find(r => r.id === lower || r.name.toLowerCase() === lower) || null;
};

const createRole = async (roleData) => {
  const roles = getJsonRoles();
  
  // Format role ID slug from name
  const slug = roleData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
  const existing = roles.find(r => r.id === slug || r.name.toLowerCase() === roleData.name.toLowerCase().trim());
  if (existing) {
    throw new Error('A role with this name already exists.');
  }

  const newRole = {
    id: slug,
    name: roleData.name.trim(),
    description: roleData.description || '',
    permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
    is_system: false,
    color: roleData.color || '#8b5cf6',
    created_at: Math.floor(Date.now() / 1000)
  };

  roles.push(newRole);
  saveJsonRoles(roles);
  return newRole;
};

const updateRole = async (roleId, roleData) => {
  const roles = getJsonRoles();
  const index = roles.findIndex(r => r.id === roleId);
  if (index === -1) {
    throw new Error('Role not found.');
  }

  // Preserve built-in state
  if (roles[index].is_system && roleData.name && roleData.name !== roles[index].name) {
    throw new Error('Cannot rename built-in system roles.');
  }

  roles[index] = {
    ...roles[index],
    name: roleData.name ? roleData.name.trim() : roles[index].name,
    description: roleData.description !== undefined ? roleData.description : roles[index].description,
    permissions: Array.isArray(roleData.permissions) ? roleData.permissions : roles[index].permissions,
    color: roleData.color || roles[index].color,
    updated_at: Math.floor(Date.now() / 1000)
  };

  saveJsonRoles(roles);
  return roles[index];
};

const deleteRole = async (roleId) => {
  let roles = getJsonRoles();
  const target = roles.find(r => r.id === roleId);
  if (!target) {
    throw new Error('Role not found.');
  }
  if (target.is_system) {
    throw new Error('Built-in system roles (Admin, Editor, Viewer) cannot be deleted.');
  }

  roles = roles.filter(r => r.id !== roleId);
  saveJsonRoles(roles);
  return true;
};

module.exports = {
  ALL_PERMISSIONS,
  getAllRoles,
  getRoleByIdOrName,
  createRole,
  updateRole,
  deleteRole
};
