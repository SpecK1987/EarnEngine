// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(cors());
app.use(express.json());

apapp.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connection successful!",
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message
    });
  }
});p.get("/", (req, res) => {
  res.json({ status: "EarnEngine backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// later: /api/downloads, /api/support, /api/users, etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});