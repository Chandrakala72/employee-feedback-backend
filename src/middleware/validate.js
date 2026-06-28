const { body, param, query, validationResult } = require("express-validator");

function check(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

/* ── Link creation ── */
const createLinkRules = [
  body("employeeName")
    .isString()
    .notEmpty()
    .withMessage("employeeName is required")
    .isLength({ max: 255 })
    .withMessage("employeeName must not exceed 255 characters"),
  body("projectName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("projectName is required and cannot be empty")
    .isLength({ max: 255 })
    .withMessage("projectName must not exceed 255 characters"),
  body("reviewerName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("reviewerName is required and cannot be empty")
    .isLength({ max: 255 })
    .withMessage("reviewerName must not exceed 255 characters"),
  body("month").isInt({ min: 0, max: 11 }).withMessage("month must be 0–11"),
  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("year must be 2000–2100"),
];

/* ── Response submission ── */
const submitResponseRules = [
  body("linkId")
    .isString()
    .notEmpty()
    .withMessage("linkId is required")
    .isUUID()
    .withMessage("linkId must be a valid UUID"),
  body("reviewerName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("reviewerName is required and cannot be empty")
    .isLength({ max: 255 })
    .withMessage("reviewerName must not exceed 255 characters"),
  body("ratings.technical")
    .notEmpty()
    .withMessage("ratings.technical is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("ratings.technical must be 1–5"),

  body("ratings.communication")
    .notEmpty()
    .withMessage("ratings.communication is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("ratings.communication must be 1–5"),

  body("ratings.reliability")
    .notEmpty()
    .withMessage("ratings.reliability is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("ratings.reliability must be 1–5"),
  body("ratings.collaboration")
    .notEmpty()
    .withMessage("ratings.collaboration is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("ratings.collaboration must be 1–5"),
  body("ratings.overall")
    .notEmpty()
    .withMessage("ratings.overall is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("ratings.overall must be 1–5"),
  body("goingWell").optional({ nullable: true }).isString(),
  body("couldImprove").optional({ nullable: true }).isString(),
];

/* ── linkId param ── */
const linkIdParam = [
  param("linkId").isString().notEmpty().isLength({ max: 36 }),
];

/* ── List query ── */
const listQuery = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 500 }),
];

module.exports = {
  check,
  createLinkRules,
  submitResponseRules,
  linkIdParam,
  listQuery,
};
