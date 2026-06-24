const localPool = require("../db/pool");
const { v4: uuidv4 } = require("uuid");

/* ── POST /api/responses ─────────────────────────────────────────────────────
   Body: {
     linkId,                 — UUID from /feedback/:linkId
     reviewerName?,          — overrides the name stored on the link (optional)
     ratings: {
       technical?,           — 1-5
       communication?,
       reliability?,
       collaboration?,
       overall               — required
     },
     goingWell?,
     couldImprove?
   }
*/
async function submitResponse(req, res) {
  const {
    linkId,
    reviewerName = null,
    ratings = {},
    goingWell = null,
    couldImprove = null,
  } = req.body;

  try {
    // ── 1. Load link from local DB ─────────────────────────────────────────
    const [links] = await localPool.query(
      `SELECT id, is_active, expires_at,
              employee_name, project_name, reviewer_name, period_label
       FROM feedback_links WHERE id = ?`,
      [linkId],
    );

    if (!links.length) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback link not found" });
    }

    const link = links[0];

    if (!link.is_active) {
      return res.status(410).json({
        success: false,
        message: "This feedback link is no longer active",
      });
    }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "This feedback link has expired" });
    }

    // ── 2. Insert response — denormalise context from link ─────────────────
    const id = uuidv4();

    await localPool.query(
      `INSERT INTO feedback_responses (
        id,
        link_id,
        employee_name,
        project_name,
        reviewer_name,
        period_label,
        rating_technical,
        rating_communication,
        rating_reliability,
        rating_collaboration,
        rating_overall,
        going_well,
        could_improve
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        link.id,
        link.employee_name,
        link.project_name ?? null,
        reviewerName ?? link.reviewer_name ?? null, // form input takes priority
        link.period_label,
        ratings.technical ?? null,
        ratings.communication ?? null,
        ratings.reliability ?? null,
        ratings.collaboration ?? null,
        ratings.overall,
        goingWell || null,
        couldImprove || null,
      ],
    );

    // ── 3. Return saved row ────────────────────────────────────────────────
    const [saved] = await localPool.query(
      "SELECT * FROM feedback_responses WHERE id = ?",
      [id],
    );

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: saved[0],
    });
  } catch (err) {
    console.error("submitResponse error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── GET /api/responses?linkId=xxx ──────────────────────────────────────────
   Returns paginated responses for a link with all fields needed for reporting.
*/
async function listResponses(req, res) {
  const { linkId } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  if (!linkId) {
    return res
      .status(400)
      .json({ success: false, message: "Provide linkId query param" });
  }

  try {
    const [[{ total }]] = await localPool.query(
      "SELECT COUNT(*) AS total FROM feedback_responses WHERE link_id = ?",
      [linkId],
    );

    const [rows] = await localPool.query(
      `SELECT
         id,
         employee_name,
         project_name,
         reviewer_name,
         period_label,
         rating_technical,
         rating_communication,
         rating_reliability,
         rating_collaboration,
         rating_overall,
         going_well,
         could_improve,
         submitted_at
       FROM feedback_responses
       WHERE link_id = ?
       ORDER BY submitted_at DESC
       LIMIT ? OFFSET ?`,
      [linkId, limit, offset],
    );

    return res.json({
      success: true,
      data: rows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listResponses error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── GET /api/responses/summary/:linkId ─────────────────────────────────────
   Aggregated averages + response count for a link.
*/
async function getResponseSummary(req, res) {
  const { linkId } = req.params;
  try {
    const [rows] = await localPool.query(
      `SELECT
         COUNT(*)                            AS response_count,
         employee_name,
         project_name,
         period_label,
         ROUND(AVG(rating_technical),     1) AS avg_technical,
         ROUND(AVG(rating_communication), 1) AS avg_communication,
         ROUND(AVG(rating_reliability),   1) AS avg_reliability,
         ROUND(AVG(rating_collaboration), 1) AS avg_collaboration,
         ROUND(AVG(rating_overall),       1) AS avg_overall
       FROM feedback_responses
       WHERE link_id = ?
       GROUP BY employee_name, project_name, period_label`,
      [linkId],
    );

    return res.json({ success: true, data: rows[0] ?? null });
  } catch (err) {
    console.error("getResponseSummary error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

module.exports = { submitResponse, listResponses, getResponseSummary };
