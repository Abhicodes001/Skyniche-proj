require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'login_app';

async function initDatabase() {
  console.log(`Connecting to MySQL server at ${DB_HOST}:${DB_PORT}...`);
  
  // 1. Connect to root MySQL instance (without database specified) to ensure database exists
  const mysqlServer = new Sequelize('', DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
  });

  try {
    await mysqlServer.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`✅ Database "${DB_NAME}" ensured in WampServer MySQL.`);
    await mysqlServer.close();
  } catch (err) {
    console.error(`⚠️ Could not create database directly (MySQL might not be running yet or custom port needed):`, err.message);
  }

  // 2. Connect to login_app database
  const sequelize = require('./config/dbconnection');
  const { Users } = require('./models/users');

  try {
    await sequelize.authenticate();
    console.log('✅ Connection to MySQL database successfully established.');

    // 3. Create / Sync table
    await Users.sync({ alter: true });
    console.log('✅ "users" table synced successfully.');

    // 4. Seed Admin Account
    const adminEmail = 'admin@example.com';
    const adminExists = await Users.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      await Users.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        user_type: 1,
        profile_pic: 'https://example.com/admin.jpg',
        status: 1,
        timestamp: Math.floor(Date.now() / 1000),
        added_by: 1,
        updated_on: Math.floor(Date.now() / 1000)
      });
      console.log('✅ Admin user created: admin@example.com / admin123 (role: admin)');
    } else {
      console.log('ℹ️ Admin user already exists: admin@example.com');
    }

    // 5. Seed Demo User Account
    const demoEmail = 'demo@example.com';
    const demoExists = await Users.findOne({ where: { email: demoEmail } });

    if (!demoExists) {
      const demoPassword = bcrypt.hashSync('password123', 10);
      await Users.create({
        name: 'Demo User',
        email: demoEmail,
        password: demoPassword,
        role: 'user',
        user_type: 3,
        profile_pic: 'https://example.com/user.jpg',
        status: 1,
        timestamp: Math.floor(Date.now() / 1000),
        added_by: 1,
        updated_on: Math.floor(Date.now() / 1000)
      });
      console.log('✅ Demo user created: demo@example.com / password123 (role: user)');
    } else {
      console.log('ℹ️ Demo user already exists: demo@example.com');
    }

    console.log('\n🎉 Database setup and seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Initialization Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
