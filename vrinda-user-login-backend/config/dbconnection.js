const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'login_app';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 2000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 2000,
    idle: 2000
  }
});

module.exports = sequelize;