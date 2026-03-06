const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
    replication: {
      read: [
        { host: process.env.DB_READ_HOST || process.env.DB_HOST, username: process.env.DB_USER, password: process.env.DB_PASS }
      ],
      write: { host: process.env.DB_HOST, username: process.env.DB_USER, password: process.env.DB_PASS }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected...');
    
    // Sync models
    await sequelize.sync({ alter: true }); // Use only in dev
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
