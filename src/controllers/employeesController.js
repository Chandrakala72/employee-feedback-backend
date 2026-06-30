// controllers/employeesController.js
const { nerdpeoplePool } = require("../db/pool");

async function getEmployeeProjects(req, res) {
  try {
    const [rows] = await nerdpeoplePool.query(`
      SELECT
        E.Name         AS employeeName,
        E.EmployeeGuid AS employeeGuid,
        E.Email        AS employeeEmail,
        P.ProjectGuid  AS projectGuid,
        P.ProjectName  AS projectName
      FROM EmployeeProject EP
      JOIN Employee E ON EP.EmployeeGuid = E.EmployeeGuid AND E.IsActive = 1
      JOIN Project  P ON EP.ProjectGuid  = P.ProjectGuid  AND P.IsActive = 1
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getEmployeeProjects error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getEmployeeProjects };
