const Course = require("../models/course");
const Chapter = require("../models/chapter");
const CourseCategory = require("../models/courseCategory");
// const UploadVideo = require("../models/uploadvideo");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const createCourse = asyncHandler(async (req, res) => {
  const image = req?.file?.path;
  if (image) req.body.image = image;
  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await Course.create(req.body);
  return res.json({
    success: response ? true : false,
    data: response ? response : "Cannot create",
  });
});
const getCourse = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const excludeFields = "title";
  const course = await Course.findById(cid)
    .populate("category", excludeFields)
    .populate({
      path: "chapters",
      populate: {
        path: "chapter",
        select: "title description lessons",
      },
    })
    .populate("ratings.postedBy", "avatar firstname lastname");
  return res.status(200).json({
    sucess: course ? true : false,
    data: course ? course : "Cannot get",
  });
});
//Filtering, sorting & pagination
// const getAllCouse = asyncHandler(async (req, res) => {
//   const queries = { ...req.query };
//   //Tách các trường db ra khỏi query
//   const excludeFields = ["limit", "sort", "page", "fields"];
//   excludeFields.forEach((el) => delete queries[el]);
//   // Format lại các operators cho đúng cú pháp mongoose
//   let queryString = JSON.stringify(queries);
//   queryString = queryString.replace(
//     /\b(gte|gt|lt|lte)\b/g,
//     (matchedEl) => `$${matchedEl}`
//   );
//   const formatedQueries = JSON.parse(queryString);
//   // Filtering
//   if (queries?.title)
//     formatedQueries.title = { $regex: queries.title, $options: "i" };
//   // if (queries?.category)
//   //   formatedQueries.category = { $regex: queries.category, $options: "i" };
//   let queryObject = {};
//   if (queries?.category) {
//     const categories = await CourseCategory.find({
//       title: { $regex: queries.category, $options: "i" },
//     });
//     const categoryIds = categories.map((category) => category._id);
//     queryObject.category = { $in: categoryIds };
//   }
//   if (req?.query?.q) {
//     delete formatedQueries.q;
//     // queryObject = {
//     //   $or: [
//     //     { title: { $regex: queries.q, $options: "i" } },
//     //     { category: { $regex: queries.q, $options: "i" } },
//     //   ],
//     // };
//     formatedQueries["$or"] = [
//       { title: { $regex: req.query.q, $options: "i" } },
//       { category: { $regex: req.query.q, $options: "i" } },
//     ];
//   }
//   const qr = { ...formatedQueries, ...queryObject };
//   let queryCommand = Course.find(qr);

//   //Sorting
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(",").join(" ");
//     queryCommand = queryCommand.sort(sortBy);
//   }

//   // Fields limiting
//   if (req.query.fields) {
//     const fields = req.query.fields.split(",").join(" ");
//     queryCommand = queryCommand.select(fields);
//   }
//   // Pagination
//   // limit : số object lấy về 1 lần gọi API
//   // skip
//   const page = +req.query.page || 1;
//   const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
//   const skip = (page - 1) * limit;
//   queryCommand.skip(skip).limit(limit);
//   // Execute query
//   // Số lượng sp thỏa mãn đk !== số lượng sp trả về 1 lần gọi API
//   queryCommand.exec(async (err, response) => {
//     if (err) throw new Error(err.message);
//     // Số lượng thỏa mãn đk
//     const counts = await Course.find(formatedQueries).countDocuments();
//     return res.status(200).json({
//       sucess: response ? true : false,
//       counts,
//       data: response ? response : "Cannot get",
//     });
//   });
// });
const getAllCouse = asyncHandler(async (req, res) => {
  try {
    const queries = { ...req.query };
    // Tách các trường db ra khỏi query
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
    if (queries?.title || queries?.title === "")
      formatedQueries.title = { $regex: queries.title, $options: "i" };
    if (queries?.categoryName || queries?.categoryName === "") {
      const categories = await CourseCategory.find({
        title: { $regex: queries.categoryName, $options: "i" },
      });
      const categoryIds = categories.map((category) => category._id);
      formatedQueries.category = { $in: categoryIds };
      delete formatedQueries.categoryName;
    }
    if (req.query.q || req.query.q === "") {
      delete formatedQueries.q;
      formatedQueries["$or"] = [
        { title: { $regex: queries.q, $options: "i" } },
      ];
    }
    // const qr = { ...formatedQueries, ...queryObject };
    let queryCommand = Course.find(formatedQueries).populate(
      "category",
      "title"
    );

    // Sorting
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
    const page = +req.query.page || 1;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    // Execute query
    const response = await queryCommand.exec();
    // Số lượng thỏa mãn điều kiện
    const counts = await Course.find(formatedQueries).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      data: response ? response : "Can get course",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const updateCourse = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  // if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const { title, price, duration, category } = req.body;
  const data = { title, price, duration, category };
  const excludeFields = "title";
  if (req.file) data.image = req.file.path;
  if (!cid || Object.keys(req.body).length === 0)
    throw new Error("Missing input");
  const courseUpdate = await Course.findByIdAndUpdate(cid, data, {
    new: true,
  }).populate("category", excludeFields);
  return res.status(200).json({
    sucess: courseUpdate ? true : false,
    data: courseUpdate ? courseUpdate : "Cannot update",
  });
});
const deleteCourse = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await Course.findByIdAndDelete(cid);
  return res.status(200).json({
    sucess: response ? true : false,
    data: response ? response : "Cannot delete",
  });
});
const updateChapter = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const { chid } = req.body;
  const course = await Course.findById(cid);
  const alreadyCart = course?.chapters?.find(
    (el) => el.chapter.toString() === chid
  );
  if (alreadyCart) {
    return res.status(200).json({
      mes: "Already have chapter",
    });
  } else {
    const response = await Course.findByIdAndUpdate(
      cid,
      {
        $push: { chapters: { chapter: chid } },
      },
      { new: true }
    );
    return res.status(200).json({
      sucess: response ? true : false,
      data: response ? response : "Something wrong",
    });
  }
});
const removeChapter = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const { chid } = req.body;
  const response = await Course.findByIdAndUpdate(
    cid,
    {
      $pull: { chapters: { chapter: chid } },
    },
    { new: true }
  );
  return res.status(200).json({
    sucess: response ? true : false,
    data: response ? response : "Something wrong",
  });
});
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, cid, updatedAt } = req.body;
  if (!star || !cid) throw new Error("Missing inputs");
  const ratingCourse = await Course.findById(cid);
  const alreadyRating = ratingCourse?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );
  if (alreadyRating) {
    // update star && comment
    await Course.updateOne(
      {
        ratings: { $elemMatch: alreadyRating },
      },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      { new: true }
    );
  } else {
    // add star && comment
    await Course.findByIdAndUpdate(
      cid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }
  // Sum ratings
  const updatedCourse = await Course.findById(cid);
  const ratingCount = updatedCourse.ratings.length;
  const sumRatings = updatedCourse.ratings.reduce(
    (sum, el) => sum + el.star,
    0
  );
  updatedCourse.rating_count = Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedCourse.save();

  return res.status(200).json({
    status: true,
    data: updateCourse ? updatedCourse : "Cannot rating",
  });
});
const countVideoCompelete = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const course = await Course.findById(cid);
  if (!course) {
    return res.status(404).json({ error: "Không tìm thấy khóa học" });
  }
  course.completed += 1;
  await course.save();
  return res.status(200).json({
    sucess: true,
    data: course,
  });
});
module.exports = {
  createCourse,
  getCourse,
  getAllCouse,
  updateCourse,
  updateChapter,
  ratings,
  deleteCourse,
  countVideoCompelete,
  removeChapter,
};
