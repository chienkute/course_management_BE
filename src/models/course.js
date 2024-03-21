const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "CourseCategory",
      required: true,
    },
    rating_average: {
      type: Number,
      default: 0,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
    },
    completed: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
        updatedAt: {
          type: Date,
        },
      },
    ],
    chapters: [
      {
        chapter: { type: mongoose.Types.ObjectId, ref: "Chapter" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Course", courseSchema);
