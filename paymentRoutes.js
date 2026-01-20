// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authRequired } = require("../middleware/authMiddleware");

router.post("/create-order", authRequired, paymentController.createOrder);
router.post("/capture-order", authRequired, paymentController.captureOrder);

module.exports = router;