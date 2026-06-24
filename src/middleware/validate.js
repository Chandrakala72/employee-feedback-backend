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
  body("reviewName")
    .isString()
    .notEmpty()
    .withMessage("reviewName is required")
    .isLength({ max: 255 }),
  body("employeeName")
    .isString()
    .notEmpty()
    .withMessage("employeeName is required")
    .isLength({ max: 255 }),
  body("projectName")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 255 }),
  body("reviewerName")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 255 }),
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
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 255 }),
  body("ratings.technical")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }),
  body("ratings.communication")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }),
  body("ratings.reliability")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }),
  body("ratings.collaboration")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }),
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
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  check,
  createLinkRules,
  submitResponseRules,
  linkIdParam,
  listQuery,
};
