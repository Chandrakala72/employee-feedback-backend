const mysql = require("mysql2/promise");

// Initialize the database if it doesn't exist
async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.LOCAL_DB_HOST,
    port: process.env.LOCAL_DB_PORT,
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD,
  });

  await connection.query(`
    CREATE DATABASE IF NOT EXISTS ${process.env.LOCAL_DB_NAME}
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
  `);

  console.log(`✅ Database ${process.env.LOCAL_DB_NAME} is ready`);

  await connection.end();
}

module.exports = initDatabase;
