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
  const response = await Chapter.find().select("_id title description");
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot get",
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
  const { title, description, status, chid, slug } = req.body;
  const response = await Chapter.findByIdAndUpdate(
    chid,
    {
      $push: { lessons: { title, description, video, status, slug } },
    },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Cannot update",
  });
});
const getLesson = asyncHandler(async (req, res) => {
  const { chid } = req.body;
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
};
