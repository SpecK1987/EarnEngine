// backend/models/User.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser(email, password) {
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role, plan)
     VALUES ($1, $2, 'user', 'free')
     RETURNING id, email, role, plan`,
    [email, hash]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash, role, plan FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function upgradeUserToPaid(userId) {
  await pool.query(
    `UPDATE users SET plan = 'paid' WHERE id = $1`,
    [userId]
  );
}

module.exports = { createUser, findUserByEmail, upgradeUserToPaid };