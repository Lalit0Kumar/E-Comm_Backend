const { required } = require("joi");
const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true },
  expire: { type: Date, required: true },
  discount: { type: Number, required: true },
});

module.exports = mongoose.model("Coupon", couponSchema);
