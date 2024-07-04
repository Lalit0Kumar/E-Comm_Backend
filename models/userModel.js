const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    // _id: { type: Number, required: true, unique: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, maxLength: 10 },
    password: { type: String, required: true },

    role: { type: String, default: "user" },
    isBlocked: { type: Boolean, default: false },
    cart: { type: Array, defaul: [] },
    address: { type: String },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

// for password hashing
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// compare Password
userSchema.methods.isPasswordMatch = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// const UserModel = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);
