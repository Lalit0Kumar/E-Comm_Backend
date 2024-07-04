const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    category: {
      type: String, // mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: "category",
    },
    brand: {
      type: String,
      required: true,
      // enum: ["Apple", "Samsung", "Google"],
    },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    images: [],
    color: { type: String, required: true }, //enum: ["Black", "White", "Skyblue"] },
    rating: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
