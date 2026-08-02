const moment = require('moment');
const Users = require('../models/users');
const bcrypt = require('bcrypt');

const createUser = async (req, reply) => {
    try {
        const { name, email, password, role, user_type, profile_pic,cover_pic, status, added_by } = req.body;

        const emailExists = await Users.userEmailExist(email);
        if (emailExists) {
            return reply.send({ status: 0, message: 'Email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password || 'password123', saltRounds);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'viewer',
            user_type: user_type || (role === 'admin' ? 1 : role === 'editor' ? 2 : 3),
            profile_pic: profile_pic || null,
            cover_pic: cover_pic || null,
            status: status !== undefined ? Number(status) : 1,
            timestamp: moment().unix(),
            added_by: added_by || 1,
            updated_on: moment().unix()
        };

        const newUserId = await Users.addUser(userData);

        if (newUserId) {
            reply.send({ status: 1, message: 'User created successfully', user_id: newUserId });
        } else {
            reply.send({ status: 0, message: 'Failed to create user' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        reply.status(500).send({ message: 'Server error' });
    }
};

const fetchAllUsers = async (req, reply) => {
    try {
        const users = await Users.getAllUsers();

        if (users && users.length > 0) {
            reply.send({ status: 1, message: 'Users fetched successfully', data: users });
        } else {
            reply.send({ status: 0, message: 'No users found' });
        }
    } catch (error) {
        console.error('Error fetching all users:', error);
        reply.status(500).send({ message: 'Server error' });
    }
};

const updateUser = async (req, reply) => {
    try {
        const { id, name, email, password, role, user_type, profile_pic,cover_pic, status, added_by } = req.body;

        const emailExists = await Users.userEmailExist(email, id);
        if (emailExists) {
            return reply.send({ status: 0, message: 'Email already exists' });
        }

        let updateData = {
            name,
            email,
            role,
            user_type,
            profile_pic: profile_pic || null,
            cover_pic: cover_pic || null,
            status: status || 1,
            added_by: added_by || 1,
            updated_on: moment().unix()
        };

        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        const updated = await Users.updateUser(id, updateData);

        if (updated) {
            reply.send({ status: 1, message: 'User updated successfully' });
        } else {
            reply.send({ status: 0, message: 'Failed to update user' });
        }
    } catch (error) {
        console.error('Error updateUserController -', error);
        reply.status(500).send({ message: 'Server error' });
    }
};

const getUserById = async (req, reply) => {
    try {
        const { id } = req.body;

        const user = await Users.getUserById(id);

        if (user) {
            reply.send({ status: 1, message: 'User fetched successfully', data: user });
        } else {
            reply.send({ status: 0, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error getUserByIdController -', error);
        reply.status(500).send({ message: 'Server error' });
    }
};

const deleteUser = async (req, reply) => {
    try {
        const { id } = req.body;

        const deleted = await Users.deleteUserModel(id);

        if (deleted) {
            reply.send({ status: 1, message: 'User deleted successfully' });
        } else {
            reply.send({ status: 0, message: 'Failed to delete user' });
        }
    } catch (error) {
        console.error('Error deleteUserController -', error);
        reply.status(500).send({ message: 'Server error' });
    }
};

module.exports = {
    createUser,
    fetchAllUsers,
    getUserById,
    updateUser,
    deleteUser
};