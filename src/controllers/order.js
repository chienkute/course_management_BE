const Order = require("../models/order");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  // const userCart = await User.findById(_id)
  //   .select("cart")
  //   .populate("cart.course", "title price");
  // const courseUser = userCart?.cart?.map((el) => ({
  //   course: el.course._id,
  // }));
  // const createData = { courses, total, orderBy: _id };
  const { courses, total, status } = req.body;
  if (!courses || !total || !status) throw new Error("Missing input");
  if (total) {
    await User.findByIdAndUpdate(_id, { cart: [] }, { new: true });
  }
  const data = { courses, total, orderBy: _id };
  if (status) data.status = status;
  const rs = await Order.create(data);
  return res.json({
    success: rs ? true : false,
    data: rs ? rs : "Cannot create",
  });
});
const getUserOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const rs = await Order.find({ orderBy: _id }).populate(
    "courses.course",
    "title image price"
  );
  const coursesArray = rs.flatMap((order) =>
    order.courses.map((course) => course.course)
  );
  return res.status(200).json({
    success: rs ? true : false,
    data: rs ? coursesArray : "Cannot get",
  });
});
const getUsersOrder = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { _id } = req.user;
  //Tách các trường db ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  let qr = { ...formatedQueries, orderBy: _id };
  let queryCommand = Order.find(qr).populate(
    "courses.course",
    "title image price"
  );

  //Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }
  // Pagination
  // limit : số object lấy về 1 lần gọi API
  // skip
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  // Execute query
  // Số lượng sp thỏa mãn đk !== số lượng sp trả về 1 lần gọi API
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    // Số lượng thỏa mãn đk
    const counts = await Order.find(qr).countDocuments();
    return res.status(200).json({
      sucess: response ? true : false,
      counts,
      data: response ? response : "Cannot get",
    });
  });
});
const getOrders = asyncHandler(async (req, res) => {
  // const response = await Order.find()
});
module.exports = {
  createOrder,
  getUserOrder,
  getOrders,
  getUsersOrder,
};
