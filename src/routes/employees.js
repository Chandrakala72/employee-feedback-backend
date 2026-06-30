// routes/employees.js
const router = require("express").Router();
const { getEmployeeProjects } = require("../controllers/employeesController");

// GET /api/employees
router.get("/", getEmployeeProjects);

module.exports = router;