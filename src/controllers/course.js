const Course = require("../models/course");
const CourseCategory = require("../models/courseCategory");
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
  const course = await Course.findById(cid).populate("category", excludeFields);
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
    // let queryObject = {};
    // if (queries?.q) {
    //   delete formatedQueries.q;
    //   queryObject = {
    //     $or: [{ title: { $regex: queries.q, $options: "i" } }],
    //   };
    // }
    // Thêm trường lọc theo tên của Category
    if (queries?.categoryName || queries?.categoryName === "") {
      const categories = await CourseCategory.find({
        title: { $regex: queries.categoryName, $options: "i" },
      });
      const categoryIds = categories.map((category) => category._id);
      formatedQueries.category = { $in: categoryIds };
      delete formatedQueries.categoryName;
    }
    // const qr = { ...formatedQueries, ...queryObject };
    let queryCommand = Course.find(formatedQueries);

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
// const deleteProduct = asyncHandler(async (req, res) => {
//   const { pid } = req.params;
//   const deletedProduct = await Product.findByIdAndDelete(pid);
//   return res.status(200).json({
//     sucess: deletedProduct ? true : false,
//     data: deletedProduct ? deletedProduct : "Cannot delete",
//   });
// });
// const ratings = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { star, comment, pid, updatedAt } = req.body;
//   if (!star || !pid) throw new Error("Missing inputs");
//   const ratingProduct = await Product.findById(pid);
//   const alreadyRating = ratingProduct?.ratings?.find(
//     (el) => el.postedBy.toString() === _id
//   );
//   if (alreadyRating) {
//     // update star && comment
//     await Product.updateOne(
//       {
//         ratings: { $elemMatch: alreadyRating },
//       },
//       {
//         $set: {
//           "ratings.$.star": star,
//           "ratings.$.comment": comment,
//           "ratings.$.updatedAt": updatedAt,
//         },
//       },
//       { new: true }
//     );
//   } else {
//     // add star && comment
//     await Product.findByIdAndUpdate(
//       pid,
//       {
//         $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
//       },
//       { new: true }
//     );
//   }
//   // Sum ratings
//   const updatedProduct = await Product.findById(pid);
//   const ratingCount = updatedProduct.ratings.length;
//   const sumRatings = updatedProduct.ratings.reduce(
//     (sum, el) => sum + el.star,
//     0
//   );
//   updatedProduct.totalRatings =
//     Math.round((sumRatings * 10) / ratingCount) / 10;

//   await updatedProduct.save();

//   return res.status(200).json({
//     status: true,
//     updatedProduct,
//   });
// });
module.exports = {
  createCourse,
  getCourse,
  getAllCouse,
  updateCourse,
};
