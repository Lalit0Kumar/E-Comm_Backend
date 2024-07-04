const Coupon = require("../models/couponModel.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");

// --------------------------------------------------------------------------------
// Create Coupon
const createCoupon = async (req, res) => {
  const payload = req.body;
  try {
    const newCoupon = await Coupon.create(payload);
    return res.json({
      success: true,
      Coupon: newCoupon,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// Get All Coupon
const getAllCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.json({
      success: true,
      Coupon: coupons,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// --------------------------------------------------------------------------------
// Update Coupon
const UpdateCoupon = async (req, res) => {
  const { id } = req.query;
  validateMongoDbId(id);
  const payload = req.body;
  try {
    const updateCoupon = await Coupon.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return res.json({
      success: true,
      Coupon: updateCoupon,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// --------------------------------------------------------------------------------
// Delete Coupon
const deleteCoupon = async (req, res) => {
  const { id } = req.query;
  validateMongoDbId(id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    return res.json({
      success: true,
      Coupon: deleteCoupon,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { createCoupon, getAllCoupon, UpdateCoupon, deleteCoupon };
