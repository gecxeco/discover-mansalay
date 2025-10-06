// backend/config/db.js
const mysql = require('mysql2/promise');

// Try to load dotenv if present (local dev). If not present, continue silently.
try {
  // only load in non-production or when dotenv is installed
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
} catch (e) {
  // dotenv not installed or failed — ignore (production environments shouldn't need it)
}

const DB_NAME = process.env.MYSQLDATABASE || process.env.DB_NAME || 'discovermansalay';

const DB_CONFIG = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '123456789',
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306),
};

let pool = null;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function tryConnectWithRetries(retries = 6, delay = 2000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const conn = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        port: DB_CONFIG.port,
      });
      await conn.ping();
      await conn.end();
      return true;
    } catch (err) {
      attempt++;
      console.warn(`DB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) await wait(delay);
      else throw err;
    }
  }
}

async function initialize() {
  if (pool) return pool;

  // 1) Ensure DB server reachable (retries)
  await tryConnectWithRetries(6, 2000);

  // 2) Optionally create database (only when allowed)
  const allowCreate = (process.env.ALLOW_DB_CREATE || 'false').toLowerCase() === 'true';
  if (allowCreate) {
    try {
      const connection = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        port: DB_CONFIG.port,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
      console.log(`✅ Database "${DB_NAME}" ensured (created if needed).`);
      await connection.end();
      // small wait to allow DB to be ready
      await wait(500);
    } catch (err) {
      console.warn('⚠️ CREATE DATABASE failed or not permitted:', err.message);
      // continue — if the DB already exists or permission denied, we'll try to connect to DB below
    }
  } else {
    console.log('ℹ️ Skipping CREATE DATABASE (ALLOW_DB_CREATE not set to true).');
  }

  // 3) Create pool that uses the database
  pool = mysql.createPool({
    ...DB_CONFIG,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONN_LIMIT ? Number(process.env.DB_CONN_LIMIT) : 10,
    queueLimit: 0,
  });

  // 4) Create tables (for prototypes). Wrap each in try/catch to avoid crashing on permission issues.
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      firstname VARCHAR(255),
      lastname VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role ENUM('user','admin'),
      contact_number VARCHAR(20),
      address TEXT,
      profile_image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255),
      item_id INT,
      name VARCHAR(255),
      category VARCHAR(255),
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username, item_id)
    );`,

    `CREATE TABLE IF NOT EXISTS navbar (
      id INT AUTO_INCREMENT PRIMARY KEY,
      logo VARCHAR(255)
    );`,

    `CREATE TABLE IF NOT EXISTS experience_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100),
      image_path VARCHAR(255),
      link VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS explorecms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      city VARCHAR(255),
      email VARCHAR(255),
      contact VARCHAR(50),
      image_path VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS hero_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      media_type ENUM('image', 'video') DEFAULT 'image',
      media_path VARCHAR(255) DEFAULT 'default.jpg',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS highlight_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      date_range VARCHAR(100),
      image_url VARCHAR(500),
      link VARCHAR(255)
    );`,

    `CREATE TABLE IF NOT EXISTS tourist_spots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      lat DECIMAL(9,6),
      lng DECIMAL(9,6),
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      category VARCHAR(100)
    );`,

    `CREATE TABLE IF NOT EXISTS destinations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const q of tableQueries) {
    try {
      await pool.query(q);
    } catch (err) {
      console.warn('⚠️ Table creation failed (this may be due to permissions):', err.message);
    }
  }

  console.log(`✅ Tables ensured (if permissions allowed) in database "${DB_NAME}".`);
  return pool;
}

async function getPool() {
  if (!pool) {
    pool = await initialize();
  }
  return pool;
}

module.exports = {
  getPool,
};
