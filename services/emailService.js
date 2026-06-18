const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendFeedbackEmail = async (employeeName, feedback) => {
  let html = `
    <h2>Employee Feedback</h2>
    <h3>${employeeName}</h3>
  `;

  feedback.forEach((item) => {
    html += `
      <hr/>
      <p>
        <strong>Question:</strong>
        ${item.question}
      </p>

      <p>
        <strong>Rating:</strong>
        ${item.rating}/5
      </p>

      <p>
        <strong>Comment:</strong>
        ${item.comment}
      </p>
    `;
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.TO_EMAIL,
    subject: `Feedback Received - ${employeeName}`,
    html,
  });
};

module.exports = {
  sendFeedbackEmail,
};
