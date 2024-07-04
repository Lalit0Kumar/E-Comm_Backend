const Category = require("../models/blogCateModel.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");
// -----------------------------------------------------------------------------------------------
// Create Category
const createCategory = async (req, res) => {
  try {
    const payload = req.body;
    const newCategory = await Category.create(payload);
    return res.json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------
// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const payload = req.body;
    const updateCategory = await Category.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return res.json({
      success: true,
      data: updateCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------
// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleteCategory = await Category.findByIdAndDelete(id);
    return res.json({
      success: true,
      data: deleteCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// -------------------------------------------------------------------------------------------------
// Get a  Category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const getCategory = await Category.findById(id);
    return res.json({
      success: true,
      data: getCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// -------------------------------------------------------------------------------------------------
// Get all  Category
const getAllCategory = async (req, res) => {
  try {
    const getAllCategory = await Category.find();
    return res.json({
      success: true,
      data: getAllCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};
