// backend/config/paypal.js
module.exports = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  mode: process.env.PAYPAL_MODE || "sandbox" // "sandbox" or "live"
};