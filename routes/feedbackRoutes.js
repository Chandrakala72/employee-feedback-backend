const express = require("express");

const { sendFeedbackEmail } = require("../services/emailService");

const router = express.Router();

router.post("/send-feedback", async (req, res) => {
  try {
    const { employeeName, feedback } = req.body;

    await sendFeedbackEmail(employeeName, feedback);

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send feedback",
    });
  }
});

module.exports = router;
