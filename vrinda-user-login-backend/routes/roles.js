const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/rolesController');

const roleRoutes = [
  {
    method: 'GET',
    url: '/api/roles',
    handler: getRoles
  },
  {
    method: 'POST',
    url: '/api/roles',
    handler: createRole
  },
  {
    method: 'PUT',
    url: '/api/roles/:id',
    handler: updateRole
  },
  {
    method: 'DELETE',
    url: '/api/roles/:id',
    handler: deleteRole
  }
];

module.exports = roleRoutes;
