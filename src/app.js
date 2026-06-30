require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const linksRouter = require("./routes/links");
const responsesRouter = require("./routes/responses");
const employeesRouter = require("./routes/employees");

const app = express();

/* ── Security headers ─────────────────────────────────────────────────────── */
app.use(helmet());

/* ── CORS ─────────────────────────────────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

/* ── Body parser ──────────────────────────────────────────────────────────── */
app.use(express.json({ limit: "64kb" }));

/* ── Rate limiting ────────────────────────────────────────────────────────── */
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use(limiter);

/* ── Routes ───────────────────────────────────────────────────────────────── */
app.use("/api/links", linksRouter);
app.use("/api/responses", responsesRouter);
app.use("/api/employees", employeesRouter);

/* ── Health check ─────────────────────────────────────────────────────────── */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

/* ── 404 ──────────────────────────────────────────────────────────────────── */
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

/* ── Global error handler ─────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
