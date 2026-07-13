const router = require("express").Router();
const { sendFeedbackEmail } = require("../controllers/feedbackController.js");

// POST /api/feedback/send-email
router.post("/send-email", sendFeedbackEmail);

module.exports = router;