const localPool = require("../db/pool");
const { v4: uuidv4 } = require("uuid");

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function periodLabel(month, year) {
  const end = Math.min(Number(month) + 5, 11);
  return `${MONTHS[month].slice(0, 3)}–${MONTHS[end].slice(0, 3)} ${year}`;
}

/* ── POST /api/links ─────────────────────────────────────────────────────────
   Body: { reviewName, employeeName, projectName?, reviewerName?, month, year }
   Returns the created row including its UUID `id`.
   The frontend stores this `id` as the linkId and embeds it in the shared URL.
*/
async function createLink(req, res) {
  const {
    reviewName,
    employeeName,
    projectName = null,
    reviewerName = null,
    month,
    year,
  } = req.body;

  try {
    const id = uuidv4();
    const label = periodLabel(Number(month), Number(year));

    await localPool.query(
      `INSERT INTO feedback_links
         (id, review_name, employee_name, project_name, reviewer_name,
          period_month, period_year, period_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        reviewName,
        employeeName,
        projectName,
        reviewerName,
        Number(month),
        Number(year),
        label,
      ],
    );

    const [rows] = await localPool.query(
      "SELECT * FROM feedback_links WHERE id = ?",
      [id],
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("createLink error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/* ── GET /api/links ──────────────────────────────────────────────────────────
   Query params: page, limit, employeeName, year
*/
async function listLinks(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const employeeFilter = req.query.employeeName || null;
  const yearFilter = req.query.year ? Number(req.query.year) : null;

  const conditions = ["is_active = 1"];
  const params = [];
  if (employeeFilter) {
    conditions.push("employee_name LIKE ?");
    params.push(`%${employeeFilter}%`);
  }
  if (yearFilter) {
    conditions.push("period_year = ?");
    params.push(yearFilter);
  }
  const where = "WHERE " + conditions.join(" AND ");

  try {
    const [[{ total }]] = await localPool.query(
      `SELECT COUNT(*) AS total FROM feedback_links ${where}`,
      params,
    );
    const [rows] = await localPool.query(
      `SELECT * FROM feedback_links ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return res.json({
      success: true,
      data: rows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listLinks error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── GET /api/links/:linkId ──────────────────────────────────────────────────
   Called by FeedbackForm on mount to load employee name, period, project, etc.
   :linkId is the UUID stored in the URL by the frontend.
*/
async function getLinkById(req, res) {
  const { linkId } = req.params;
  try {
    const [rows] = await localPool.query(
      "SELECT * FROM feedback_links WHERE id = ? AND is_active = 1",
      [linkId],
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found or inactive" });
    }
    const link = rows[0];
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "This feedback link has expired" });
    }
    return res.json({ success: true, data: link });
  } catch (err) {
    console.error("getLinkById error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

/* ── DELETE /api/links/:id ───────────────────────────────────────────────────
   Soft-delete — sets is_active = 0.
*/
async function deactivateLink(req, res) {
  const { id } = req.params;
  try {
    const [result] = await localPool.query(
      "UPDATE feedback_links SET is_active = 0 WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found" });
    }
    return res.json({ success: true, message: "Link deactivated" });
  } catch (err) {
    console.error("deactivateLink error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
}

module.exports = { createLink, listLinks, getLinkById, deactivateLink };
