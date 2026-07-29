const fs = require('fs');
const path = require('path');
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
    password: { type: Sequelize.STRING(300), allowNull: false },
    email: { type: Sequelize.STRING(300), allowNull: false },
    role: { type: Sequelize.STRING(300), allowNull: false },
    user_type: { type: Sequelize.INTEGER, allowNull: false },
    profile_pic: { type: Sequelize.STRING(800), allowNull: true },
    cover_pic: { type: Sequelize.STRING(800), allowNull: true },
    status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    timestamp: { type: Sequelize.INTEGER, allowNull: false },
    added_by: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    updated_on: { type: Sequelize.INTEGER, allowNull: false },
  },
  { tableName: "users", timestamps: false }
);

// Fallback JSON DB File Path
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const jsonDbPath = path.join(dataDir, 'users_store.json');

const initialUsers = [
  {
    id: 1,
    name: "System Admin",
    email: "admin@example.com",
    password: "$2a$10$e8wE4z4Tj2lP4R5n5Y4.0uN1N/4Y1K4b5x8K9.Q7r0R1N2O3P4Q5W",
    role: "admin",
    user_type: 1,
    status: 1,
    timestamp: Math.floor(Date.now() / 1000),
    added_by: 1,
    updated_on: Math.floor(Date.now() / 1000)
  },
  {
    id: 2,
    name: "Demo User",
    email: "demo@example.com",
    password: "$2a$10$e8wE4z4Tj2lP4R5n5Y4.0uN1N/4Y1K4b5x8K9.Q7r0R1N2O3P4Q5W",
    role: "user",
    user_type: 3,
    status: 1,
    timestamp: Math.floor(Date.now() / 1000),
    added_by: 1,
    updated_on: Math.floor(Date.now() / 1000)
  }
];

function getJsonUsers() {
  if (!fs.existsSync(jsonDbPath)) {
    fs.writeFileSync(jsonDbPath, JSON.stringify(initialUsers, null, 2));
    return [...initialUsers];
  }
  try {
    const raw = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [...initialUsers];
  }
}

function saveJsonUsers(users) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error saving JSON users:", e);
  }
}

const addUser = async (data) => {
  try {
    const result = await Users.create(data);
    return result.dataValues.id;
  } catch (error) {
    console.log("MySQL unavailable, using JSON DB for addUser:", error.message);
    const users = getJsonUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, ...data };
    users.push(newUser);
    saveJsonUsers(users);
    return newId;
  }
};

const updateUser = async (userId, data) => {
  try {
    const result = await Users.update(data, {
      where: { id: userId },
    });
    return result[0] > 0;
  } catch (error) {
    console.log("MySQL unavailable, using JSON DB for updateUser:", error.message);
    const users = getJsonUsers();
    const index = users.findIndex(u => u.id === Number(userId));
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveJsonUsers(users);
      return true;
    }
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
    const users = getJsonUsers();
    return users.some(u => u.email === email && u.status === 1);
  }
};

const getUserById = async (id) => {
  try {
    const [result] = await sequelize.query(
      `SELECT id, name, email, role, user_type, profile_pic, cover_pic, status, timestamp, added_by, updated_on FROM users WHERE id = :id AND status != 0`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );
    return result || false;
  } catch (error) {
    const users = getJsonUsers();
    const found = users.find(u => u.id === Number(id) && u.status !== 0);
    return found || false;
  }
};

const getUserProfile = async (user_id) => {
  try {
    const result = await Users.findOne({
      where: { id: user_id, status: 1 },
    });
    return result ? result.dataValues : false;
  } catch (error) {
    const users = getJsonUsers();
    const found = users.find(u => u.id === Number(user_id) && u.status === 1);
    return found || false;
  }
};

const getAllUsers = async () => {
  try {
    const [results] = await sequelize.query(
      `SELECT id, name, email, role, user_type, profile_pic, cover_pic, status, timestamp, added_by, updated_on FROM users WHERE status != 0`
    );
    if (results && results.length > 0) return results;
    return getJsonUsers().filter(u => u.status !== 0);
  } catch (error) {
    console.log("MySQL unavailable, using JSON DB for getAllUsers");
    return getJsonUsers().filter(u => u.status !== 0);
  }
};

const deleteUserModel = async (user_id) => {
  try {
    const result = await Users.destroy({
      where: { id: user_id }
    });
    return result > 0;
  } catch (error) {
    console.log("MySQL unavailable, using JSON DB for deleteUserModel");
    let users = getJsonUsers();
    const filtered = users.filter(u => u.id !== Number(user_id));
    if (filtered.length !== users.length) {
      saveJsonUsers(filtered);
      return true;
    }
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
    const users = getJsonUsers();
    return users.some(u => u.email === email && u.id !== Number(id) && u.status === 1);
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
