const express = require("express");
const {
  createCoupon,
  getAllCoupon,
  UpdateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { checkAuth, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/", checkAuth, isAdmin, createCoupon);
router.put("/", checkAuth, isAdmin, UpdateCoupon);
router.delete("/", checkAuth, isAdmin, deleteCoupon);
router.get("/", checkAuth, getAllCoupon);

module.exports = router;
