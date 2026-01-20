// backend/controllers/paymentController.js
const paypalConfig = require("../config/paypal");
const { upgradeUserToPaid } = require("../models/User");
const fetch = require("node-fetch"); // add to package.json if needed

async function getAccessToken() {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
  ).toString("base64");

  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await res.json();
  return data.access_token;
}

exports.createOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "19.00" // example membership price
            }
          }
        ]
      })
    });

    const orderData = await orderRes.json();
    res.json(orderData);
  } catch (err) {
    res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

exports.captureOrder = async (req, res) => {
  try:
    const { orderId } = req.body;
    const accessToken = await getAccessToken();

    const captureRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const captureData = await captureRes.json();

    // If successful, upgrade user to paid
    if (captureData.status === "COMPLETED") {
      await upgradeUserToPaid(req.user.id);
    }

    res.json(captureData);
  } catch (err) {
    res.status(500).json({ message: "Failed to capture PayPal order" });
  }
};