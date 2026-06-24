require("dotenv").config();

const app = require("./src/app");
const initializeDatabase = require("./src/db/init");
const initDatabase = require("./src/db/initDatabase");

const PORT = Number(process.env.PORT) || 3001;

(async () => {
  try {
    await initDatabase();       // Create DB if not exists
    await initializeDatabase(); // Create tables if not exist

    app.listen(PORT, () => {
      console.log(`🚀 Feedback API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();