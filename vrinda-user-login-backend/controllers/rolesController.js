const rolesModel = require('../models/roles');

const getRoles = async (req, reply) => {
  try {
    const roles = await rolesModel.getAllRoles();
    return reply.send({
      status: 1,
      roles,
      available_permissions: rolesModel.ALL_PERMISSIONS
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return reply.status(500).send({ status: 0, message: 'Server error fetching roles' });
  }
};

const createRole = async (req, reply) => {
  try {
    const { name, description, permissions, color } = req.body;
    if (!name || !name.trim()) {
      return reply.send({ status: 0, message: 'Role name is required' });
    }

    const newRole = await rolesModel.createRole({ name, description, permissions, color });
    return reply.send({ status: 1, message: 'Role created successfully', role: newRole });
  } catch (error) {
    return reply.send({ status: 0, message: error.message || 'Failed to create role' });
  }
};

const updateRole = async (req, reply) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, color } = req.body;

    const updated = await rolesModel.updateRole(id, { name, description, permissions, color });
    return reply.send({ status: 1, message: 'Role updated successfully', role: updated });
  } catch (error) {
    return reply.send({ status: 0, message: error.message || 'Failed to update role' });
  }
};

const deleteRole = async (req, reply) => {
  try {
    const { id } = req.params;
    await rolesModel.deleteRole(id);
    return reply.send({ status: 1, message: 'Role deleted successfully' });
  } catch (error) {
    return reply.send({ status: 0, message: error.message || 'Failed to delete role' });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
