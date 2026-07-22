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
    console.error("User Login Error:", error);
    return { error: "Server error" };
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