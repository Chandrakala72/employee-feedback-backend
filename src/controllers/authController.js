// controllers/authController.js
const jwt = require("jsonwebtoken");
const users = require("../config/users.json");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-env";

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required" });
  }

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid username or password" });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: "8h",
  });

  return res.json({ success: true, token, username: user.username });
}

module.exports = { login };
