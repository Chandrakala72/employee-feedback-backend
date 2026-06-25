-- ─────────────────────────────────────────────────────────────────────────────
-- Technerds Feedback  –  MySQL Schema
-- ─────────────────────────────────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS technerds_feedback CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE technerds_feedback;

-- ─── 1. feedback_links ───────────────────────────────────────────────────────
CREATE TABLE
  IF NOT EXISTS feedback_links (
    id CHAR(36) NOT NULL DEFAULT (UUID ()),
    review_name VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NULL,
    reviewer_name VARCHAR(255) NULL,
    period_month TINYINT NOT NULL,
    period_year SMALLINT NOT NULL,
    period_label VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    is_active TINYINT (1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_employee (employee_name),
    KEY idx_period (period_year, period_month),
    KEY idx_active (is_active)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ─── 2. feedback_responses ───────────────────────────────────────────────────
-- Ratings and comments are stored AES-256-GCM encrypted.
-- Format per encrypted field: base64(iv):base64(authTag):base64(ciphertext)
-- Plain fields (employee_name, project_name, etc.) are stored as-is
-- because they are already known to the link creator — no sensitivity.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE
  IF NOT EXISTS feedback_responses (
    id CHAR(36) NOT NULL DEFAULT (UUID ()),
    link_id CHAR(36) NOT NULL,
    -- context — plain text (known to link creator, not sensitive)
    employee_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NULL,
    reviewer_name VARCHAR(255) NULL,
    period_label VARCHAR(50) NOT NULL,
    -- ratings — AES-256-GCM encrypted  (stored as TEXT: iv:tag:ciphertext)
    rating_technical TEXT NULL,
    rating_communication TEXT NULL,
    rating_reliability TEXT NULL,
    rating_collaboration TEXT NULL,
    rating_overall TEXT NOT NULL,
    -- comments — AES-256-GCM encrypted
    going_well TEXT NULL,
    could_improve TEXT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_link_id (link_id),
    KEY idx_employee (employee_name),
    KEY idx_submitted_at (submitted_at),
    CONSTRAINT fk_response_link FOREIGN KEY (link_id) REFERENCES feedback_links (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;