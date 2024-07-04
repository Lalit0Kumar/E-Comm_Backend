// controllers/orderController.js
const Order = require("../models/orderModel.js");
const Cart = require("../models/cartModel.js");
const Coupon = require("../models/couponModel.js");
const Razorpay = require("razorpay");
const axios = require("axios");
const validateMongoDbId = require("../utils/validateMongodbId.js");
require("dotenv").config();

// Razorpay Key Integration
let instance = new Razorpay({
  key_id: process.env.KEY_ID || "rzp_test_9x4iOh5SbMDG1Z",
  key_secret: process.env.KEY_SECRET || "VSflxsA16pNUxVoXZCenM2iz",
});
// -------------------------------------------------------------------------------------------------------
// Create Order
const createOrder = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;

  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    if (!cart) {
      return res
        .status(500)
        .json({ success: false, message: "Cart Not Found" });
    }

    if (coupon) {
      const validCoupon = await Coupon.findOne({ name: coupon });
      if (!validCoupon) {
        return res
          .status(500)
          .json({ success: false, message: "Invalid Coupon" });
      }
      const { discount } = validCoupon;
      let totalAfterDiscount = (
        cart.cartTotal -
        (cart.cartTotal * discount) / 100
      ).toFixed(2);
      cart.totalAfterDiscount = totalAfterDiscount;
      await cart.save();
    }
    const finalAmount = cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.cartTotal;

    const newOrder = new Order({
      products: cart.products,
      paymentIntent: {},
      orderStatus: "Not Processed",
      orderby: _id,
      cartTotal: cart.cartTotal,
      totalAfterDiscount: cart.totalAfterDiscount,
    });

    await newOrder.save();
    await Cart.deleteOne({ orderby: _id });
    return res.status(201).json({
      success: true,
      message: "Order Create Successfully",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Order",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------------------------------
//  Controller Function to initiate Payment

const orderPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 1,
    };
    // Create a new order with Razorpay

    //   let order = instance.orders.create(option, (err, order) => {
    //     if (err) {
    //       return res.status(500).json({ success: false, error: error.message });
    //     }
    //     return res.status(200).json({ success: true, order: order });
    //   });
    // } catch (error) {
    //   return res.status(500).json({ success: false, error: error.message });
    // }

    let order = await instance.orders.create(options);
    console.log("Order created:", order);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// ----------------------------------------------------------------------------------------------------------
// Controller Function to capture the payment
const capturePayment = async (req, res) => {
  // Capture the payment using Razorpay API
  const { paymentId, amount } = req.body;
  console.log("Payment ID:", paymentId);
  console.log("Amount:", amount);

  try {
    // return request(
    //   {
    //     method: "POST",
    //     url: `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
    //     auth: {
    //       user: process.env.KEY_ID,
    //       pass: process.env.KEY_SECRET,
    //     },
    //     form: {
    //       amount: req.body.amount * 10,
    //       currency: "INR",
    //     },
    //   },
    const response = await axios({
      method: "POST",
      url: `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
      auth: {
        username: process.env.KEY_ID,
        password: process.env.KEY_SECRET,
      },
      data: {
        amount: amount * 100, // Amount should be in paise
        currency: "INR",
      },
    });
    return res.status(200).json({ success: true, body: response.data });
    //   function (err, response, body) {
    //     if (err) {
    //       return res
    //         .status(500)
    //         .json({ success: false, message: "Something went wrong" });
    //     }
    //     return res.status(200).json({ success: true, body });
    //   }
    // );
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createOrder, orderPayment, capturePayment };
