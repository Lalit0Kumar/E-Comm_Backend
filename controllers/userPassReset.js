const User = require("../models/userModel.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../config/emailConfig.js");
require("dotenv").config();

//   CHANGE PASSWORD
const changeUserPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.send({
      Sucess: false,
      Message: "Password required",
    });
  } else {
    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(req.user._id, {
      $set: { password: newHashPassword },
    });
    return res.send({
      Sucess: true,
      Message: " Password change  Successfully...",
    });
  }
};
// ---------------------------------------------------------------------------------------------------------

// Send Password Reset Email
const sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .send({ Sucess: false, Message: "Email field is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ Sucess: false, message: "Email not found" });
    }

    const secret = user._id + process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });
    const link = `http://localhost:3001/api/user/reset-password?token=${token}`;

    try {
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Email",
        html: `<p><a href="${link}">Click here</a> to reset your password. The link will expire in 1 hour.</p>`,
      });
      return res.status(200).send({
        Sucess: true,
        message: "Password reset email sent. Please check your email.",
        token: token,
        info: info,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).send({
        Sucess: false,
        message: "Failed to send password reset email.",
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    return res
      .status(500)
      .send({ Sucess: false, message: "Server error occurred." });
  }
};

// --------------------------------------------------------------------------------------------------

//  After send Mail Change Password  And Check valid user
const userPasswordReset = async (req, res) => {
  const { password } = req.body;
  // token pass in header with bearer
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  // if (!token && req.query.token) {
  //   token = req.query.token;
  // }

  if (!password || !token) {
    return res
      .status(400)
      .send({ Sucess: false, message: "All fields are required" });
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).send({ Sucess: false, message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send({ Sucess: fasle, message: "User not found" });
    }

    const secret = user._id + process.env.JWT_SECRET;
    jwt.verify(token, secret); // Verifies the token with the secret

    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: newHashPassword },
    });

    return res
      .status(200)
      .send({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .send({ Sucess: true, message: "Invalid or expired token" });
  }
};

module.exports = {
  changeUserPassword,
  sendUserPasswordResetEmail,
  userPasswordReset,
};
