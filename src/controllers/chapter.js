const Chapter = require("../models/chapter");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const createChapter = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await Chapter.create(req.body);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot create",
  });
});
const getChapters = asyncHandler(async (req, res) => {
  // const response = await Chapter.find().select("_id title description");
  // return res.json({
  //   success: response ? true : false,
  //   data: response ? response : "Cannot get",
  // });
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
  let queryCommand = Chapter.find(formatedQueries);

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
    const counts = await Chapter.find(formatedQueries).countDocuments();
    return res.status(200).json({
      sucess: response ? true : false,
      data: response ? response : "Cannot get",
      counts,
    });
  });
});
const updateChapter = asyncHandler(async (req, res) => {
  const { chid } = req.params;
  const response = await Chapter.findByIdAndUpdate(chid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot update",
  });
});
const updateLessons = asyncHandler(async (req, res) => {
  const video = req?.file?.path;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const { title, chid, slug } = req.body;
  const response = await Chapter.findByIdAndUpdate(
    chid,
    {
      $push: { lessons: { title, video, slug } },
    },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Cannot update",
  });
});
const deleteLessons = asyncHandler(async (req, res) => {
  const { chid } = req.params;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const { title, video, slug } = req.body;
  const response = await Chapter.findByIdAndUpdate(
    chid,
    {
      $pull: { lessons: { title, video, slug, status: "Not" } },
    },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Cannot delete",
  });
});
const getLesson = asyncHandler(async (req, res) => {
  const { chid } = req.params;
  const response = await Chapter.find({ _id: chid }).select("lessons");
  return res.status(200).json({
    success: response ? true : false,
    data: response ? response : "Cannot get",
  });
});
const deleteChapter = asyncHandler(async (req, res) => {
  const { chid } = req.params;
  const response = await Chapter.findByIdAndDelete(chid);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot delete",
  });
});
module.exports = {
  createChapter,
  getChapters,
  updateChapter,
  deleteChapter,
  updateLessons,
  getLesson,
  deleteLessons,
};
