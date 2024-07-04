const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
} = require("../controllers/brandController.js");
const { isAdmin, checkAuth } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.get("/get", getAllBrand);
router.post("/", checkAuth, isAdmin, createBrand);
router.put("/:id", checkAuth, isAdmin, updateBrand);
router.delete("/:id", checkAuth, isAdmin, deleteBrand);
router.get("/:id", getBrand);

module.exports = router;
