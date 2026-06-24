-- ─────────────────────────────────────────────────────────────────────────────
-- Technerds Feedback  –  MySQL Schema
-- ─────────────────────────────────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS technerds_feedback CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE technerds_feedback;

-- ─── 1. feedback_links ───────────────────────────────────────────────────────
-- One row per generated feedback URL.
-- UUID (id) is embedded in the URL and used as linkId everywhere.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE
  IF NOT EXISTS feedback_links (
    id CHAR(36) NOT NULL DEFAULT (UUID ()),
    review_name VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NULL,
    reviewer_name VARCHAR(255) NULL,
    period_month TINYINT NOT NULL, -- 0 = January … 11 = December
    period_year SMALLINT NOT NULL,
    period_label VARCHAR(50) NOT NULL, -- e.g. "Jan–Jun 2026"
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL, -- NULL = never expires
    is_active TINYINT (1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_employee (employee_name),
    KEY idx_period (period_year, period_month),
    KEY idx_active (is_active)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ─── 2. feedback_responses ───────────────────────────────────────────────────
-- One row per submitted feedback form.
-- employee_name, project_name, reviewer_name, period_label are denormalised
-- from feedback_links so each response is self-contained for reporting.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE
  IF NOT EXISTS feedback_responses (
    id CHAR(36) NOT NULL DEFAULT (UUID ()),
    link_id CHAR(36) NOT NULL, -- FK → feedback_links.id
    -- context (denormalised from feedback_links)
    employee_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NULL,
    reviewer_name VARCHAR(255) NULL,
    period_label VARCHAR(50) NOT NULL, -- e.g. "Jan–Jun 2026"
    -- ratings (1-5, NULL = skipped by reviewer)
    rating_technical TINYINT NULL CHECK (rating_technical BETWEEN 1 AND 5),
    rating_communication TINYINT NULL CHECK (rating_communication BETWEEN 1 AND 5),
    rating_reliability TINYINT NULL CHECK (rating_reliability BETWEEN 1 AND 5),
    rating_collaboration TINYINT NULL CHECK (rating_collaboration BETWEEN 1 AND 5),
    rating_overall TINYINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    -- comments
    going_well TEXT NULL,
    could_improve TEXT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_link_id (link_id),
    KEY idx_employee (employee_name),
    KEY idx_submitted_at (submitted_at),
    CONSTRAINT fk_response_link FOREIGN KEY (link_id) REFERENCES feedback_links (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;