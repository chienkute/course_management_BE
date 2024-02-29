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
    },
    rating_count: {
      type: Number,
    },
    duration: {
      type: String,
      require: true,
    },
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