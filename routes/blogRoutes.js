const express = require("express");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} = require("../controllers/blogController.js");
const { checkAuth, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  blogImgResize,
  uploadPhoto,
} = require("../middlewares/uploadImages.js");
const router = express.Router();

router.post("/", checkAuth, isAdmin, createBlog);
router.put("/like", checkAuth, likeBlog);
router.put(
  "/upload/:id",
  checkAuth,
  isAdmin,
  uploadPhoto.array("images", 5),
  blogImgResize,
  uploadImages
);
router.put("/dislike", checkAuth, dislikeBlog);
router.put("/:id", checkAuth, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlog);
router.delete("/:id", checkAuth, isAdmin, deleteBlog);

module.exports = router;
