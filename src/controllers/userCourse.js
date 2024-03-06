const Order = require("../models/order");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const getCourseUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cid } = req.params;
  const userOrder = await Order.find({ orderBy: _id });
  for (const order of userOrder) {
    for (const course of order.courses) {
      if (course.course._id.toString() === cid) {
        return res.status(200).json({
          accept: true,
        });
      }
    }
  }
  return res.status(200).json({
    accept: false,
  });
});
const getCourseCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cid } = req.params;
  const userCart = await User.findById(_id)
    .select("cart")
    .populate("cart.course", "title price");
  for (const cartItem of userCart.cart) {
    if (cartItem.course._id.toString() === cid) {
      return res.status(200).json({
        success: true,
      });
    }
  }

  return res.status(200).json({
    success: false,
  });
});
module.exports = { getCourseUser, getCourseCart };
