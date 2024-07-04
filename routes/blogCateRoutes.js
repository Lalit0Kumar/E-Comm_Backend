const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
} = require("../controllers/blogCateCtrl.js");
const { isAdmin, checkAuth } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.get("/get", getAllCategory);
router.post("/", checkAuth, isAdmin, createCategory);
router.put("/:id", checkAuth, isAdmin, updateCategory);
router.delete("/:id", checkAuth, isAdmin, deleteCategory);
router.get("/:id", getCategory);

module.exports = router;
