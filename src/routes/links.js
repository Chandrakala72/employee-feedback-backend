const router = require("express").Router();
const ctrl = require("../controllers/linksController");
const v = require("../middleware/validate");
const { requireAuth } = require("../middleware/authMiddleware");

// POST   /api/links            — create a new link → LOCAL DB
router.post("/", requireAuth, v.createLinkRules, v.check, ctrl.createLink);

// GET    /api/links            — list all links ← LOCAL DB
router.get("/", requireAuth, v.listQuery, v.check, ctrl.listLinks);

// GET    /api/links/:linkId    — fetch one link by UUID ← LOCAL DB
router.get("/:linkId", ctrl.getLinkById);

// DELETE /api/links/:id        — soft-delete → LOCAL DB
router.delete("/:id", requireAuth, ctrl.deactivateLink);

module.exports = router;
