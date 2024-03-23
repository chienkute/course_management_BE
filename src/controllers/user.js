const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/jwt");
// const jwt = require("jsonwebtoken");
const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstname, lastname } = req.body;
  if (!email || !password || !lastname || !firstname || !username)
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
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({
      sucess: false,
      message: "Missing input",
    });
  const response = await User.findOne({ username });
  if (response && (await response.isCorrectPassword(password))) {
    // tách paswd , role ra khỏi response
    const { password, role, refreshToken, ...user } = response.toObject();
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
      user,
      role,
    });
  } else {
    throw new Error("Invalid credentials");
  }
});
const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id)
    .select("-refreshToken -password -role")
    .populate({
      path: "cart",
      populate: {
        path: "course",
        select: "title image price",
      },
    });
  return res.status(200).json({
    success: user ? true : false,
    data: user ? user : "User not found",
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
  if (req.query.q || req.query.q === "") {
    delete formatedQueries.q;
    formatedQueries["$or"] = [
      { firstname: { $regex: queries.q, $options: "i" } },
      { lastname: { $regex: queries.q, $options: "i" } },
      { email: { $regex: queries.q, $options: "i" } },
    ];
  }
  let queryCommand = User.find(formatedQueries);

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
    const counts = await User.find(formatedQueries).countDocuments();
    return res.status(200).json({
      sucess: response ? true : false,
      counts,
      data: response ? response : "Cannot get",
    });
  });
});
const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) throw new Error("Missing id");
  const response = await User.findByIdAndDelete(uid);
  return res.status(200).json({
    sucess: response ? true : false,
    data: response ? "User has been deleted" : "No user been deleted",
  });
});
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { firstname, lastname, skill, mobile, address } = req.body;
  const data = { firstname, lastname, mobile, skill, address };
  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing input");
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    sucess: response ? true : false,
    data: response ? response : "Something wrong",
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
    data: response ? response : "Something wrong",
  });
});
const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cid, quantity = 1 } = req.body;
  if (!cid || !quantity) throw new Error("Missing");
  const user = await User.findById(_id).select("cart");
  const alreadyCart = user?.cart?.find((el) => el.course.toString() === cid);
  if (alreadyCart) {
    const response = await User.updateOne(
      {
        cart: { $elemMatch: alreadyCart },
      },
      {
        $set: {
          "cart.$.quantity": quantity,
        },
      }
    );
    return res.status(200).json({
      sucess: response ? true : false,
      data: response ? response : "Something wrong",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: { cart: { course: cid, quantity } },
      },
      { new: true }
    );
    return res.status(200).json({
      sucess: response ? true : false,
      data: response ? response : "Something wrong",
    });
  }
});
const removeCourse = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cid, quantity } = req.body;
  const response = await User.findByIdAndUpdate(
    _id,
    {
      $pull: { cart: { course: cid, quantity } },
    },
    { new: true }
  );
  return res.status(200).json({
    sucess: response ? true : false,
    data: response ? response : "Something wrong",
  });
});
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { _id } = req.user;
  const user = await User.findById(_id);
  bcrypt.compare(oldPassword, user.password, async (err, result) => {
    if (result === true) {
      try {
        const salt = bcrypt.genSaltSync(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        const response = await User.findByIdAndUpdate(
          _id,
          { password: hashedNewPassword },
          {
            new: true,
          }
        ).select("-password -role -refreshToken");
        return res.status(200).json({
          succress: response ? true : false,
          data: response ? response : "Cannot change",
        });
      } catch (e) {}
    }
  });
});
module.exports = {
  register,
  login,
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateCart,
  removeCourse,
  updatePassword,
};
