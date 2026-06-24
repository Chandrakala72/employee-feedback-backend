const mysql = require("mysql2/promise");

// Initialize the database if it doesn't exist
async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`
    CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
  `);

  console.log(`✅ Database ${process.env.DB_NAME} is ready`);

  await connection.end();
}

module.exports = initDatabase;
