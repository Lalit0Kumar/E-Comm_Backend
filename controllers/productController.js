const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const cloudinaryUploadImg = require("../utils/cloudinary.js");
const fs = require("fs");

// ---------------------------------------------------------------------------------------------------------
// Create Product
const createProduct = async (req, res) => {
  const payload = req.body;
  try {
    if (payload.title) {
      payload.slug = slugify(payload.title);
    }
    const newProduct = await Product.create(payload);
    return res.send({ Product: newProduct });
  } catch (error) {
    return res.send({
      sucess: false,
      error: error.message,
    });
  }
};
// ----------------------------------------------------------------------------------------------------------------

// get Single product
const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    // console.log(findProduct);
    return res.send({
      sucess: true,
      message: "Product Found",
      Product: findProduct,
    });
  } catch (error) {
    return res.send({ sucess: false, error: error.message });
  }
};

// ----------------------------------------------------------------------------------------------------------

// Get All Product
const getAllProduct = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeField = ["page", "sort", "limit", "fields"];
    excludeField.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));
    //  Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    //  Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select(`-__v`);
    }

    // Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        return res.send({
          sucess: false,
          message: "This Page does not Exists",
        });
      }
    }
    query = query.skip(skip).limit(limit);
    const product = await query;
    return res.send({
      sucess: true,
      message: "Product Found",
      Product: product,
    });
  } catch (error) {
    return res.send({
      sucess: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//------------------------------------------------------------------------------------------------------

//Update a product
const updateProduct = async (req, res) => {
  const payload = req.body;
  const { id } = req.params;
  try {
    if (payload.title) {
      payload.slug = slugify(payload.title);
    }
    const updateProduct = await Product.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });
    return res.send({ sucess: true, updateProduct: updateProduct });
  } catch (error) {
    return res.send({
      sucess: false,
      error: error.message,
    });
  }
};

//------------------------------------------------------------------------------------------------------

//Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProduct = await Product.findOneAndDelete({ _id: id });
    return res.send({ sucess: true, deleteProduct: deleteProduct });
  } catch (error) {
    return res.send({
      sucess: false,
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------------------------------------
// Add Wishlist

const addToWishlist = async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById({ _id });
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      return res.json({
        user: user,
      });
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      return res.json({
        user: user,
      });
    }
  } catch (error) {
    return res.send({
      sucess: false,
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------------------------------------------
// Add Rating of product

const rating = async (req, res) => {
  //here we can find three things like id ,star
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.rating.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          rating: { $elemMatch: alreadyRated },
        },
        {
          $set: { "rating.$.star": star, "rating.$.comment": comment },
        },
        {
          new: true,
        }
      );
      // return res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            rating: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
      // return res.json(rateProduct);
    }
    //  Update TotalRating or Get all Rating
    const getallrating = await Product.findById(prodId);
    let TotalRating = getallrating.rating.length;
    let ratingsum = getallrating.rating
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / TotalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      {
        new: true,
      }
    );
    return res.json(finalproduct);
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------------------------
// Upload Images

const uploadImages = async (req, res) => {
  // console.log(req.files);

  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
      // console.log(newpath);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );

    return res.json({
      success: true,
      findProduct,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
};
