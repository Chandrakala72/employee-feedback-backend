const router = require("express").Router();
const ctrl = require("../controllers/responsesController");
const { requireAuth } = require("../middleware/authMiddleware");
const v = require("../middleware/validate");

// POST  /api/responses                    — submit a feedback form → LOCAL DB
router.post("/", v.submitResponseRules, v.check, ctrl.submitResponse);

// GET   /api/responses?linkId=xxx         — list responses for a link ← LOCAL DB
router.get("/", requireAuth, v.listQuery, v.check, ctrl.listResponses);

// GET   /api/responses/summary/:linkId    — aggregated averages ← LOCAL DB
router.get("/summary/:linkId", requireAuth, ctrl.getResponseSummary);

module.exports = router;
