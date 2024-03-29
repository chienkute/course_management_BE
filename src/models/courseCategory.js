const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var courseCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    image: {
      type: String,
      require: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("CourseCategory", courseCategorySchema);
