const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool to the MySQL database using environment variables
const pool = mysql.createPool({
  host: process.env.LOCAL_DB_HOST || "localhost",
  port: Number(process.env.LOCAL_DB_PORT) || 3306,
  database: process.env.LOCAL_DB_NAME || "technerds_feedback",
  user: process.env.LOCAL_DB_USER || "root",
  password: process.env.LOCAL_DB_PASSWORD || "Selvam@1996",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00", // always store UTC
  charset: "utf8mb4",
});

const nerdpeoplePool = mysql.createPool({
  host: process.env.NERDPEOPLE_DB_HOST,
  port: process.env.NERDPEOPLE_DB_PORT,
  database: process.env.NERDPEOPLE_DB_NAME,
  user: process.env.NERDPEOPLE_USER,
  password: process.env.NERDPEOPLE_DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// Verify connectivity at startup
pool
  .getConnection()
  .then((conn) => {
    console.log("MySQL connected –", process.env.LOCAL_DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("MySQL connection failed:", err.message);
    process.exit(1);
  });

nerdpeoplePool
  .getConnection()
  .then((conn) => {
    console.log("Nerdpeople MySQL connected –", process.env.NERDPEOPLE_DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("Nerdpeople MySQL connection failed:", err.message);
    process.exit(1); // or just warn if it's non-critical
  });

module.exports = { pool, nerdpeoplePool };
