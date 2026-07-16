const { transporter, SENDER, RECIPIENT, CC } = require("../services/mailer");
const { buildFeedbackEmailHtml } = require("../utils/emailTemplate");

const QUESTION_LABELS = {
  technical: "Technical Skills",
  communication: "Communication Skills",
  reliability: "Reliability",
  solving: "Problem Solving",
  collaboration: "Collaboration",
  overall: "Overall Rating",
};

async function sendFeedbackEmail(req, res) {
  const requestId = req.id || "unknown";

  try {
    const {
      employeeName = "Anonymous",
      reviewerName,
      clientName,
      periodLabel,
      ratings = {},
      goingWell,
      couldImprove,
    } = req.body;

    if (
      !ratings ||
      typeof ratings !== "object" ||
      Object.keys(ratings).length === 0
    ) {
      return res
        .status(400)
        .json({ error: "ratings is required and must be a non-empty object" });
    }

    const responses = Object.entries(ratings).map(([key, rating]) => ({
      question: QUESTION_LABELS[key] ?? key,
      rating: rating ?? "-",
    }));

    const html = buildFeedbackEmailHtml({
      name: employeeName,
      reviewerName,
      clientName,
      periodLabel,
      responses,
      goingWell,
      couldImprove,
    });

    console.log(
      JSON.stringify({
        level: "INFO",
        requestId,
        message: "Sending feedback email",
      }),
    );

    const info = await transporter.sendMail({
      from: SENDER,
      to: RECIPIENT,
      cc: CC.length > 0 ? CC : undefined,
      subject: `New Feedback for ${employeeName}`,
      html,
    });

    console.log(
      JSON.stringify({
        level: "INFO",
        requestId,
        message: "Email sent",
        messageId: info.messageId,
      }),
    );

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        requestId,
        message: "Failed to send feedback",
        error: err.message,
      }),
    );
    return res.status(500).json({ error: "Failed to send feedback" });
  }
}

module.exports = { sendFeedbackEmail };
