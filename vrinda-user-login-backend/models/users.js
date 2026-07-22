const sequelize = require("../config/dbconnection");
const Sequelize = require("sequelize");

const Users = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: Sequelize.STRING(300), allowNull: false },
    password: {
      type: Sequelize.STRING(300),
      allowNull: false,
      // charset: "utf8mb3",
      // collate: "utf8mb3_general_ci",
    },
    email: { type: Sequelize.STRING(300), allowNull: false, },
    role: { type: Sequelize.STRING(300), allowNull: false, },
    user_type: { type: Sequelize.INTEGER, allowNull: false },
    profile_pic: { type: Sequelize.STRING(800), allowNull: true },
    cover_pic: { type: Sequelize.STRING(800), allowNull: true },
    status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    timestamp: { type: Sequelize.INTEGER, allowNull: false, },
    added_by: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1  },
    updated_on: { type: Sequelize.INTEGER, allowNull: false, },
  },
  { tableName: "users", timestamps: false }
);

const addUser = async (data) => {
  try {
    const result = await Users.create(data);
    return result.dataValues.id;
  } catch (error) {
    console.log("Error adding user - ", error);
    return false;
  }
};

const updateUser = async (userId, data) => {
  try {
    const result = await Users.update(data, {
      where: { id: userId },
    });
    return result[0] > 0;
  } catch (error) {
    console.log("error updateUser - ", error);
    return false;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({
      where: { email, status: 1 },
    });
    return !!user;
  } catch (error) {
    console.log("Error getUserByEmail admin - ", error);
    return false;
  }
};

const getUserById = async (id) => {
  try {
    const [result] = await sequelize.query(
      `SELECT 
          id, 
          name, 
          email, 
          role,
          user_type,
          profile_pic,
          cover_pic,
          status,
          timestamp,
          added_by,
          updated_on
       FROM users
       WHERE id = :id AND status != 0`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return result || false;
  } catch (error) {
    console.log("Error getUserById - ", error);
    return false;
  }
};

const getUserProfile = async (user_id) => {
  try {
    const result = await Users.findOne({
      where: { id: user_id, status: 1 },
    });
    return result ? result.dataValues : false;
  } catch (error) {
    console.log("Error getUserProfile - ", error);
    return false;
  }
};

const getAllUsers = async () => {
  try {
    const [results] = await sequelize.query(
      `SELECT 
          id, 
          name, 
          email, 
          role,
          user_type,
          profile_pic,
          cover_pic,
          status,
          timestamp,
          added_by,
          updated_on
       FROM users
       WHERE status != 0`
    );

    return results;
  } catch (error) {
    console.error("Error getAllUsers:", error);
    return false;
  }
};

const deleteUserModel = async (user_id) => {
  try {
    const result = await Users.update(
      { status: 0 },
      { where: { id: user_id } }
    );
    return result[0] > 0;
  } catch (error) {
    console.log("Error deleteUser - ", error);
    return false;
  }
};

const userEmailExist = async (email, id = 0) => {
  try {
    const whereClause = id
      ? `email = :email AND id != :id AND status = 1`
      : `email = :email AND status = 1`;

    const replacements = id ? { email, id } : { email };

    const [results] = await sequelize.query(
      `SELECT email FROM users WHERE ${whereClause}`,
      { replacements }
    );
    return results.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};

module.exports = {
  Users,
  addUser,
  updateUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUserModel,
  getUserProfile,
  userEmailExist,
};
