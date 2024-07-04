const express = require("express");
const router = express.Router();
const {
  createOrder,
  orderPayment,
  capturePayment,
} = require("../controllers/orderController.js");
const { checkAuth } = require("../middlewares/authMiddleware.js");

router.post("/", checkAuth, createOrder);

// Create order with payment online
router.post("/orderPayment", orderPayment);

// Capture Payment
router.post("/capture", capturePayment);

module.exports = router;
