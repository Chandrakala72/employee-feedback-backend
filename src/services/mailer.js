const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SENDER = process.env.SENDER_EMAIL;

const RECIPIENT = (process.env.RECIPIENT_EMAIL || "")
  .split(",")
  .map((addr) => addr.trim())
  .filter(Boolean);

const CC = (process.env.CC_EMAIL || "")
  .split(",")
  .map((addr) => addr.trim())
  .filter(Boolean);

module.exports = { transporter, SENDER, RECIPIENT, CC };