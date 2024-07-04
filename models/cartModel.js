const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        count: Number,
        color: String,
        price: Number,
      },
    ],
    cartTotal: {
      type: Number,
      required: true,
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
    },
    cartBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
