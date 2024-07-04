const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
} = require("../controllers/userController.js");
const { checkAuth, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  changeUserPassword,
  sendUserPasswordResetEmail,
  userPasswordReset,
} = require("../controllers/userPassReset.js");
const router = express.Router();

// Public Routes
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/getall", getAllUser);
router.get("/logout", logout);
router.delete("/:id", deleteUser);

router.post("/usercart", checkAuth, userCart);
router.post("/cart/applycoupon", checkAuth, applyCoupon);

router.get("/refresh", handleRefreshToken);

router.get("/get", checkAuth, getUser);
router.post("/empty-cart", checkAuth, emptyCart);
router.get("/getwishlist", checkAuth, getWishlist);
router.get("/cart", checkAuth, getUserCart);
//router.get("/empty-cart", checkAuth, emptyCart);

router.put("/edit", checkAuth, updateUser);
router.put("/save-address", checkAuth, saveAddress);
router.put("/blockuser/:id", checkAuth, isAdmin, blockUser);
router.put("/unblockuser/:id", checkAuth, isAdmin, unBlockUser);
router.post("/changepassword", checkAuth, changeUserPassword);
router.post("/sendresetpassemail", sendUserPasswordResetEmail);
router.post("/reset-password", userPasswordReset); //token authorize in headers

module.exports = router;
