const { pool: localPool } = require("../db/pool");
const { encrypt, decryptRow } = require("../db/crypto");
const { v4: uuidv4 } = require("uuid");

/* ── POST /api/responses ─────────────────────────────────────────────────────
   Encrypts ratings + comments then inserts into local DB.
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
    const [links] = await localPool.query(
      `SELECT id, is_active, expires_at,
              employee_name, project_name, reviewer_name, period_label
       FROM feedback_links WHERE id = ?`,
      [linkId],
    );

    if (!links.length)
      return res
        .status(404)
        .json({ success: false, message: "Feedback link not found" });

    const link = links[0];

    if (!link.is_active)
      return res.status(410).json({
        success: false,
        message: "This feedback link is no longer active",
      });

    if (link.expires_at && new Date(link.expires_at) < new Date())
      return res
        .status(410)
        .json({ success: false, message: "This feedback link has expired" });

    /* Encrypt sensitive fields */
    const enc = {
      rating_technical: encrypt(ratings.technical ?? null),
      rating_communication: encrypt(ratings.communication ?? null),
      rating_reliability: encrypt(ratings.reliability ?? null),
      rating_collaboration: encrypt(ratings.collaboration ?? null),
      rating_overall: encrypt(ratings.overall),
      going_well: encrypt(goingWell || null),
      could_improve: encrypt(couldImprove || null),
    };

    const id = uuidv4();
    const submittedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    await localPool.query(
      `INSERT INTO feedback_responses (
        id, link_id,
        employee_name, project_name, reviewer_name, period_label,
        rating_technical, rating_communication, rating_reliability,
        rating_collaboration, rating_overall,
        going_well, could_improve,submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        link.id,
        link.employee_name,
        link.project_name ?? null,
        reviewerName ?? link.reviewer_name ?? null,
        link.period_label,
        enc.rating_technical,
        enc.rating_communication,
        enc.rating_reliability,
        enc.rating_collaboration,
        enc.rating_overall,
        enc.going_well,
        enc.could_improve,
        submittedAt,
      ],
    );

    const [saved] = await localPool.query(
      "SELECT * FROM feedback_responses WHERE id = ?",
      [id],
    );

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: decryptRow(saved[0]), // return readable values to frontend
    });
  } catch (err) {
    console.error("submitResponse error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── GET /api/responses ──────────────────────────────────────────────────────
   linkId is OPTIONAL — omit it to fetch ALL responses (dashboard use).
   Supports: ?linkId=xxx  ?employeeName=xxx  ?projectName=xxx  ?periodLabel=xxx
             ?page=1  ?limit=20
   Decrypts all sensitive fields before returning.
*/
async function listResponses(req, res) {
  const { linkId, employeeName, projectName, periodLabel } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(500, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (linkId) {
    conditions.push("link_id = ?");
    params.push(linkId);
  }
  if (employeeName) {
    conditions.push("employee_name LIKE ?");
    params.push(`%${employeeName}%`);
  }
  if (projectName) {
    conditions.push("project_name LIKE ?");
    params.push(`%${projectName}%`);
  }
  if (periodLabel) {
    conditions.push("period_label = ?");
    params.push(periodLabel);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  try {
    const [[{ total }]] = await localPool.query(
      `SELECT COUNT(*) AS total FROM feedback_responses ${where}`,
      params,
    );

    console.log(
      "listResponses query:",
      `SELECT COUNT(*) AS total FROM feedback_responses ${where}`,
      params,
    );

    const [rows] = await localPool.query(
      `SELECT
         id, link_id,
         employee_name, project_name, reviewer_name, period_label,
         rating_technical, rating_communication, rating_reliability,
         rating_collaboration, rating_overall,
         going_well, could_improve, submitted_at
       FROM feedback_responses
       ${where}
       ORDER BY submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    console.log(
      "listResponses query:",
      `SELECT
         id, link_id,
         employee_name, project_name, reviewer_name, period_label,
         rating_technical, rating_communication, rating_reliability,
         rating_collaboration, rating_overall,
         going_well, could_improve, submitted_at
       FROM feedback_responses
       ${where}
       ORDER BY submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    /* Decrypt every row before sending */
    const decrypted = rows.map(decryptRow);

    console.log("listResponses decrypted:", decrypted);
    return res.json({
      success: true,
      data: decrypted,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listResponses error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── GET /api/responses/summary/:linkId ─────────────────────────────────────
   Decrypts rows in JS then computes averages
   (SQL AVG() can't operate on encrypted TEXT columns).
*/
async function getResponseSummary(req, res) {
  const { linkId } = req.params;

  try {
    const [rows] = await localPool.query(
      `SELECT
         employee_name, project_name, period_label,
         rating_technical, rating_communication, rating_reliability,
         rating_collaboration, rating_overall
       FROM feedback_responses WHERE link_id = ?`,
      [linkId],
    );

    if (!rows.length) return res.json({ success: true, data: null });

    const decrypted = rows.map(decryptRow);

    function avg(field) {
      const vals = decrypted
        .map((r) => r[field])
        .filter((v) => v !== null && v !== undefined);
      if (!vals.length) return null;
      return (
        Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      );
    }

    return res.json({
      success: true,
      data: {
        response_count: decrypted.length,
        employee_name: rows[0].employee_name,
        project_name: rows[0].project_name,
        period_label: rows[0].period_label,
        avg_technical: avg("rating_technical"),
        avg_communication: avg("rating_communication"),
        avg_reliability: avg("rating_reliability"),
        avg_collaboration: avg("rating_collaboration"),
        avg_overall: avg("rating_overall"),
      },
    });
  } catch (err) {
    console.error("getResponseSummary error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

module.exports = { submitResponse, listResponses, getResponseSummary };
