const express = require("express");
const { checkAuth, isAdmin } = require("../middlewares/authMiddleware.js");

const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
} = require("../controllers/productController.js");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages.js");
const router = express.Router();

router.post("/", checkAuth, isAdmin, createProduct);
router.put(
  "/upload/:id",
  checkAuth,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

router.put("/wishlist", checkAuth, addToWishlist);
router.put("/rating", checkAuth, rating);
router.put("/:id", checkAuth, isAdmin, updateProduct);

router.get("/getproduct/:id", getProduct);
router.get("/get", getAllProduct);
router.delete("/:id", checkAuth, isAdmin, deleteProduct);

module.exports = router;
