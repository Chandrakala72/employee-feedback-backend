const express = require("express");
const cors = require("cors");
require("dotenv").config();

const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api", feedbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
