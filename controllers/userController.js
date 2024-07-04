const User = require("../models/userModel.js");
const generateToken = require("../config/jwtToken.js");
const generateRefreshToken = require("../config/refreshtoken.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");
const Coupon = require("../models/couponModel.js");
// const { errorHandler } = require("../middlewares/errorHandler.js");

// Register a user

// Joi validation for user registration
const userSchema = Joi.object({
  firstname: Joi.string().max(50).required(),
  lastname: Joi.string().max(50).required(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const createUser = async (req, res) => {
  // destructure which are come from the req.body
  const { firstname, lastname, email, password } = req.body;

  // validate usin joi
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findOne({ email: email });
  if (user) {
    return res.send({ sucess: false, Message: "email already exists" });
  } else {
    if (firstname && lastname && email && password) {
      try {
        const newUser = await User.create(req.body);
        return res.status(201).json({
          sucess: true,
          message: "User Create Sucessfully",
          data: newUser,
          token: generateToken(newUser?._id),
        });
      } catch (error) {
        return res.send({ success: false, Message: "Unable to Register " });
      }
    } else {
      return res.send({ Success: false, Message: "All field are required" });
    }
  }
};

// -----------------------------------------------------------------------------------------------------------//

// Login A user

//  Joi validation for user login
const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate usin joi
    const { error } = loginUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (email && password) {
      const findUser = await User.findOne({ email: email });
      // console.log(findUser);
      if (findUser != null) {
        // Compare Password Using Bcryptjs
        const isPasswordMatch = await findUser.isPasswordMatch(password);
        if (findUser.email === email && isPasswordMatch) {
          const refreshToken = await generateToken(findUser?._id);
          const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
              refreshToken: refreshToken,
            },
            {
              new: true,
            }
          );
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
          return res.json({
            _id: findUser?._id, //_id:findUser && findUser._id
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
          });
        } else {
          return res.send({
            Status: "failed",
            Message: "Email and Password not Match",
          });
        }
      } else {
        return res.send({
          Status: "failed",
          Message: "You are not register user",
        });
      }
    } else {
      return res.send({ Status: "failed", Message: "All field are required" });
    }
  } catch (error) {
    console.log(error);
    return res.send({ Status: "failed", Message: "Unable to response" });
  }
};

// -----------------------------------------------------------------------------------------------------------//

// Login A user

//  Joi validation for user login
const loginAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate usin joi
    const { error } = loginAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (email && password) {
      const findAdmin = await User.findOne({ email: email });
      if (findAdmin.role !== "admin") {
        return res.json({
          Success: false,
          message: "Not Authorised",
          // error: error.message,
        });
      }
      // console.log(findUser);
      if (findAdmin != null) {
        // Compare Password Using Bcryptjs
        const isPasswordMatch = await findAdmin.isPasswordMatch(password);
        if (findAdmin.email === email && isPasswordMatch) {
          const refreshToken = await generateToken(findAdmin?._id);
          const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
              refreshToken: refreshToken,
            },
            {
              new: true,
            }
          );
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
          return res.json({
            _id: findAdmin?._id, //_id:findUser && findUser._id
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
          });
        } else {
          return res.send({
            Status: "failed",
            Message: "Email and Password not Match",
          });
        }
      } else {
        return res.send({
          Status: "failed",
          Message: "You are not register user",
        });
      }
    } else {
      return res.send({ Status: "failed", Message: "All field are required" });
    }
  } catch (error) {
    console.log(error);
    return res.send({ Status: "failed", Message: "Unable to response" });
  }
};

// ----------------------------------------------------------------------------------------//

// Get All Document or All User
const getAllUser = async (req, res) => {
  try {
    const findUser = await User.find();
    return res.status(200).json({
      sucess: true,
      message: "Get All The User From Database ",
      user: findUser,
    });
  } catch {
    throw new Error("Cannot find user Cheack your Code");
  }
};

// ----------------------------------------------------------------------------------------//

// Get Single Document or Single User
const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    validateMongoDbId(id);
    const findUser = await User.findById(id);
    return res.status(200).json({
      sucess: true,
      message: "Get Single User  ",
      user: findUser,
    });
  } catch {
    return res.status(400).json({
      success: false,
      message: "Cannot find user Cheack your Code",
      error: error.stack,
    });
  }
};

// -----------------------------------------------------------------------------------------//

//  Delete A User
const deleteUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const result = await User.findByIdAndDelete({ _id: id });
    return res
      .status(200)
      .json({ sucess: true, message: "User Delete Sucessfully", result });
  } catch (error) {
    res.send({ sucess: false, error: error.message });
  }
};

//---------------------------------------------------------------------------------//
// handle refresh token
const handleRefreshToken = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    return res.send({
      success: false,
      message: "No Refresh Token In Cookies",
    });
  }
  const refreshToken = cookie.refreshToken;
  // console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  // console.log(user);
  if (!user) {
    return res.send({
      success: false,
      message: "No user found for the provided refresh token",
    });
  }
  // Token verification and further actions if needed
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    // console.log(decoded);
    if (err || user.id !== decoded.id) {
      return res.send({
        success: false,
        message: "There is Something wrong with refresh token",
      });
    } else {
      const accessToken = generateToken(user && user._id);
      return res.send({
        success: true,
        accessToken: accessToken,
      });
    }
  });
};

// ---------------------------------------------------------------------------------//

// Logout Functionality
const logout = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    return res.send({
      success: false,
      message: "No Refresh Token In Cookies",
    });
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  } else {
    await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      {
        refreshToken: "",
      }
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204);
  }
};

// -------------------------------------------------------------------------------//

// Update User
const updateUser = async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  try {
    const result = await User.findByIdAndUpdate(id, req.body);
    return res.status(200).send({
      sucess: true,
      message: "User Update Sucessfully",
      result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Can Not Update",
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------//

// Save address of  User
const saveAddress = async (req, res) => {
  const { id } = req.user;
  validateMongoDbId(id);
  try {
    const result = await User.findByIdAndUpdate(
      id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    return res.status(200).send({
      sucess: true,
      message: "User Update Sucessfully",
      result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------------------------------
// Blocked User By Admin By passing the token of Admin login
const blockUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    if (!blockedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User blocked", user: blockedUser });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: error.message,
    });
  }
};
// --------------------------------------------------------------------------------------------------
//Unblock a User By Admin

const unBlockUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    if (!unblockedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User unblocked", user: unblockedUser });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error unblocking user",
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------------------------------------
// Get the Wishlist

const getWishlist = async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    return res.json({
      success: true,
      findUser,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------------------------------
// Add Cart
const userCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    let products = [];
    const user = await User.findById(_id);
    // Cheack if user already have Product in cart
    const alreadyExisCart = await Cart.findOne({ orderby: user._id });
    console.log("User ID:", user._id);
    if (alreadyExisCart) {
      alreadyExisCart.deleteOne();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    // console.log(products, cartTotal);
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    // console.log(newCart);
    return res.json({ success: true, newCart });
  } catch (error) {
    return res.status(400).json({
      Success: false,
      error: error.stack,
    });
  }
};
// ---------------------------------------------------------------------------------------------------
// Get User Cart

const getUserCart = async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
      // "_id title price totalAfterDiscoun "
    );
    return res.json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------------------------------
// Empty User Cart

const emptyCart = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  // console.log(_id);
  try {
    // const user = await User.findOne({ _id: _id });
    const cart = await Cart.deleteMany({ orderby: _id });
    return res.json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// ----------------------------------------------------------------------------------------------------------------------
// Apply Coupon

const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    // errorHandler(error, req, res);
    return res.json({
      success: false,
      message: "invalid coupon",
    });
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  });
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  return res.json({ success: true, totalAfterDiscount });
};

module.exports = {
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
};
