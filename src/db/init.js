const pool = require("./pool");

async function initializeDatabase() {
  // Create tables if they don't exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_links (
        id VARCHAR(36) PRIMARY KEY,
        review_name VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        project_name VARCHAR(255),
        reviewer_name VARCHAR(255),
        period_month INT NOT NULL,
        period_year INT NOT NULL,
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
        project_name VARCHAR(255),
        reviewer_name VARCHAR(255),
        period_label VARCHAR(50) NOT NULL,
        rating_technical TEXT NULL,
        rating_communication TEXT NULL,
        rating_reliability TEXT NULL,
        rating_collaboration TEXT NULL,
        rating_overall TEXT NOT NULL,

        going_well TEXT NULL,
        could_improve TEXT NULL,

        submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_feedback_link
          FOREIGN KEY (link_id)
          REFERENCES feedback_links(id)
          ON DELETE CASCADE
      )
    `);

    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
  }
}

module.exports = initializeDatabase;
