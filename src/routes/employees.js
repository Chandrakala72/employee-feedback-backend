// routes/employees.js
const router = require("express").Router();
const { getEmployeeProjects } = require("../controllers/employeesController");
const { requireAuth } = require("../middleware/authMiddleware");

// GET /api/employees
router.get("/", requireAuth, getEmployeeProjects);

module.exports = router;
