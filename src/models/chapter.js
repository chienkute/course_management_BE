const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  lessons: [
    {
      title: { type: String },
      description: { type: String },
      video: { type: String },
      status: { type: String, default: "Not", enum: ["Not", "Succeed"] },
      slug: {
        type: String,
        unique: true,
        lowercase: true,
      },
    },
  ],
});

//Export the model
module.exports = mongoose.model("Chapter", chapterSchema);
