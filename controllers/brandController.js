const Brand = require("../models/brandModel.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");
// -----------------------------------------------------------------------------------------------
// Create Brand
const createBrand = async (req, res) => {
  try {
    const payload = req.body;
    const newBrand = await Brand.create(payload);
    return res.json({
      success: true,
      data: newBrand,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------
// Update Brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const payload = req.body;
    const updateBrand = await Brand.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return res.json({
      success: true,
      data: updateBrand,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------
// Delete Brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const deleteBrand = await Brand.findByIdAndDelete(id);
    return res.json({
      success: true,
      data: deleteBrand,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// -------------------------------------------------------------------------------------------------
// Get a  Brand
const getBrand = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const getBrand = await Brand.findById(id);
    return res.json({
      success: true,
      data: getBrand,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// -------------------------------------------------------------------------------------------------
// Get all  Brand
const getAllBrand = async (req, res) => {
  try {
    const getAllBrand = await Brand.find();
    return res.json({
      success: true,
      data: getAllBrand,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
};
