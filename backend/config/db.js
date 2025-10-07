// backend/config/db.js
const mysql = require('mysql2/promise');

// Load dotenv only for local development
try {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
} catch (e) {
  // Ignore if dotenv is missing in production
}

// --------------------------------------------
// 🧠 Auto-detect if Railway's DATABASE_URL is used
// --------------------------------------------
let pool = null;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function initialize() {
  if (pool) return pool;

  // If Railway provides DATABASE_URL, use that directly
  if (process.env.DATABASE_URL) {
    try {
      pool = mysql.createPool(process.env.DATABASE_URL + '?connectionLimit=10');
      await pool.query('SELECT 1');
      console.log('✅ Connected to Railway MySQL via DATABASE_URL');
      return pool;
    } catch (err) {
      console.error('❌ Failed to connect using DATABASE_URL:', err.message);
      throw err;
    }
  }

  // --------------------------------------------
  // 🧩 Fallback for local development
  // --------------------------------------------
  const DB_NAME = process.env.MYSQLDATABASE || process.env.DB_NAME || 'discovermansalay';
  const DB_CONFIG = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '123456789',
    port: process.env.MYSQLPORT
      ? Number(process.env.MYSQLPORT)
      : process.env.DB_PORT
      ? Number(process.env.DB_PORT)
      : 3306,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  // Try connecting locally
  try {
    pool = mysql.createPool(DB_CONFIG);
    await pool.query('SELECT 1');
    console.log(`✅ Connected to local MySQL: ${DB_CONFIG.host}/${DB_NAME}`);
  } catch (err) {
    console.error('❌ Failed to connect to local MySQL:', err.message);
    throw err;
  }

  // Ensure tables (for prototypes)
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
      console.warn('⚠️ Table creation failed:', err.message);
    }
  }

  console.log(`✅ Tables ensured in database "${DB_NAME}".`);
  return pool;
}

async function getPool() {
  if (!pool) {
    pool = await initialize();
  }
  return pool;
}

module.exports = { getPool };
