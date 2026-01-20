const express = require("express");
const app = express();
const pool = require("./config/db");

// your middleware
// your routes
// your other endpoints

// ✅ Add your test endpoints HERE (before app.listen)
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.get("/api/db-test", async (req, res) => {
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
});

// ❗ Must be at the very bottom
app.listen(process.env.PORT || 4000, () => {
  console.log("Server running");
});