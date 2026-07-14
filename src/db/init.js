const { pool } = require("./pool");

async function initializeDatabase() {
  // Create tables if they don't exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_links (
        id VARCHAR(36) PRIMARY KEY,
        employee_name VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        reviewer_name VARCHAR(255) NOT NULL,
        period_label VARCHAR(50) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        expires_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create feedback_responses table with foreign key to feedback_links
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_responses (
        id VARCHAR(36) PRIMARY KEY,
        link_id VARCHAR(36) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        reviewer_name VARCHAR(255) NOT NULL,
        period_label VARCHAR(50) NOT NULL,
        rating_technical TEXT NOT NULL,
        rating_communication TEXT NOT NULL,
        rating_reliability TEXT NOT NULL,
        rating_collaboration TEXT NOT NULL,
        rating_solving TEXT NOT NULL,
        rating_overall TEXT NOT NULL,

        going_well TEXT NULL,
        could_improve TEXT NULL,

        submitted_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),

        CONSTRAINT fk_feedback_link
          FOREIGN KEY (link_id)
          REFERENCES feedback_links(id)
          ON DELETE CASCADE
      )
    `);

    console.log("Database tables initialized");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

module.exports = initializeDatabase;
