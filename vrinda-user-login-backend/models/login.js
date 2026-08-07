const sequelize = require('../config/dbconnection');
const Sequelize = require('sequelize')

const userLogin = async (email) => {
  try {
    const [results] = await sequelize.query(
      `SELECT 
          id AS user_id, 
          name, 
          password, 
          user_type, 
          email, 
          role
       FROM users
       WHERE email = :email AND status = 1`,
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return results || false;
  } catch (error) {
    const { Users, getAllUsers } = require('./users');
    const users = await getAllUsers();
    const found = users.find(u => u.email === email && u.status === 1);
    if (found) {
      return {
        user_id: found.id,
        name: found.name,
        password: found.password,
        user_type: found.user_type,
        email: found.email,
        role: found.role
      };
    }
    return false;
  }
};

const checkOldPassword = async (userId) => {
    try {
        const [result] = await sequelize.query(
            `SELECT 
                u.id AS user_id, 
                u.name, 
                u.password, 
                u.user_type, 
                u.email, 
                u.role
             FROM users u
             WHERE u.id = :userId AND u.status = 1`,
            {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return result || false;
    } catch (error) {
        console.error("Error occurred during database query:", error);
        return false;
    }
};

module.exports = { userLogin, checkOldPassword }