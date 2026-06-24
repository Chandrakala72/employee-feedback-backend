const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool to the MySQL database using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || "technerds_feedback",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Selvam@1996",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00", // always store UTC
  charset: "utf8mb4",
});

// Verify connectivity at startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅  MySQL connected –", process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌  MySQL connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
