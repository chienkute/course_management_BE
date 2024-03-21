const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");

const createBlog = asyncHandler(async (req, res) => {
  const image = req?.file?.path;
  if (image) req.body.image = image;
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await Blog.create(req.body);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot create",
  });
});
const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const { title, description, category } = req.body;
  const data = { title, description, category };
  if (req?.file) data.image = req?.file?.path;
  if (Object.keys(req.body).length === 0) throw new Error("Missing input");
  const response = await Blog.findByIdAndUpdate(bid, data, { new: true });
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot update",
  });
});
const getBlogs = asyncHandler(async (req, res) => {
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
  if (req.query.q || req.query.q === "") {
    delete formatedQueries.q;
    formatedQueries["$or"] = [{ title: { $regex: queries.q, $options: "i" } }];
  }
  let queryCommand = Blog.find(formatedQueries);

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
    const counts = await Blog.find(formatedQueries).countDocuments();
    return res.status(200).json({
      sucess: response ? true : false,
      data: response ? response : "Cannot get",
      counts,
    });
  });
});
const getBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  //   populate : lấy thông tin của các trường từ các bảng khóa ngoại
  const blog = await Blog.findById(bid);
  return res.json({
    success: blog ? true : false,
    data: blog ? blog : "Cannot get",
  });
});
const deleteBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndDelete(bid);
  return res.json({
    success: blog ? true : false,
    data: blog ? blog : "Cannot delete",
  });
});
module.exports = {
  createBlog,
  updateBlog,
  getBlogs,
  getBlog,
  deleteBlog,
};
