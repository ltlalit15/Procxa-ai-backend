// MySQL2 connection utility for license operations
const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

// Create connection pool for better performance
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10000,
  queueLimit: 0
});

module.exports = pool;

