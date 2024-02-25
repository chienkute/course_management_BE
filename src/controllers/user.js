const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/jwt");
const jwt = require("jsonwebtoken");
const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !lastname || !firstname)
    return res.status(400).json({
      sucess: false,
      message: "Missing input",
    });
  const user = await User.findOne({ email });
  if (user) throw new Error("User has existed");
  else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      sucess: newUser ? true : false,
      mes: newUser ? "Register is succesfully" : "Something went wrong",
    });
  }
});
//Access token : Xác thực ng dùng , phân quyền ng dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      sucess: false,
      message: "Missing input",
    });
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    // tách paswd , role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();
    const accessToken = generateAccessToken(response._id, role);
    const newRefreshToken = generateRefreshToken(response._id);
    // Lưu refesh token vào db
    await User.findByIdAndUpdate(
      response._id,
      { newRefreshToken },
      { new: true }
    );
    // Lưu refresh token vào cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      sucess: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credentials");
  }
});
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id)
    .select("-refreshToken -password -role")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumb price",
      },
    });
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  //Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token không
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookies");
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    sucess: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  });
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refreshToken in cookies");
  // Xóa refreshToken trong db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // Xóa ở cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: "Logout is done",
  });
});
const getUsers = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
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

  // Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };
  // const query = {};
  // if (req.query.q) {
  //   query = {
  //     $or: [
  //       { name: { $regex: req.query.q, $options: "i" } },
  //       { email: { $regex: req.query.q, $options: "i" } },
  //     ],
  //   };
  // }
  if (req.query.q) {
    delete formatedQueries.q;
    formatedQueries["$or"] = [
      { firstname: { $regex: queries.q, $options: "i" } },
      { lastname: { $regex: queries.q, $options: "i" } },
      { email: { $regex: queries.q, $options: "i" } },
    ];
  }
  let queryCommand = User.find(q);

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
    const counts = await Product.find(q).countDocuments();
    return res.status(200).json({
      sucess: response ? true : false,
      counts,
      data: response ? response : "Cannot get",
    });
  });
});
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  if (!_id) throw new Error("Missing id");
  const response = await User.findByIdAndDelete(_id);
  return res.status(200).json({
    sucess: response ? true : false,
    deletedUser: response ? "User has been deleted" : "No user been deleted",
  });
});
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { firstname, lastname, email, mobile } = req.body;
  const data = { firstname, lastname, email, mobile };
  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing input");
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    sucess: response ? true : false,
    updated: response ? response : "Something wrong",
  });
});
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing input");
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    sucess: response ? true : false,
    updated: response ? response : "Something wrong",
  });
});
const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, quantity = 1, color, price } = req.body;
  if (!pid || !quantity) throw new Error("Missing");
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  if (alreadyProduct) {
    const response = await User.updateOne(
      {
        cart: { $elemMatch: alreadyProduct },
      },
      { $set: { "cart.$.quantity": quantity, "cart.$.price": price } }
    );
    return res.status(200).json({
      sucess: response ? true : false,
      updated: response ? response : "Something wrong",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: { cart: { product: pid, quantity, color, price } },
      },
      { new: true }
    );
    return res.status(200).json({
      sucess: response ? true : false,
      updated: response ? response : "Something wrong",
    });
  }
});
const removeProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color } = req.params;
  const user = await User.findById(_id).select("cart");
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  );
  if (!alreadyProduct) {
    return res.status(200).json({
      sucess: true,
      updated: "update your cart",
    });
  }
  const response = await User.findByIdAndUpdate(
    _id,
    {
      $pull: { cart: { product: pid, color } },
    },
    { new: true }
  );
  return res.status(200).json({
    sucess: response ? true : false,
    updated: response ? response : "Something wrong",
  });
});
const test = asyncHandler(async (req, res) => {
  return res.status(200).json({
    sucess: true,
  });
});
module.exports = {
  // register,
  // login,
  // getCurrent,
  // refreshAccessToken,
  // logout,
  // getUsers,
  // deleteUser,
  // updateUser,
  // updateUserByAdmin,
  // updateCart,
  // removeProduct,
  test,
};
