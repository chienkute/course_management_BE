const CourseCategory = require("../models/courseCategory");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const image = req?.file?.path;
  if (image) req.body.image = image;
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await CourseCategory.create(req.body);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot create",
  });
});
const getCategories = asyncHandler(async (req, res) => {
  const response = await CourseCategory.find().select("title _id image");
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot get",
  });
});
const updateCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await CourseCategory.findByIdAndUpdate(bcid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot update",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await CourseCategory.findByIdAndDelete(bcid);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot delete",
  });
});
module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
