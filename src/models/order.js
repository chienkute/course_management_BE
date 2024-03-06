const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    courses: [
      {
        course: { type: mongoose.Types.ObjectId, ref: "Course" },
        quantity: Number,
      },
    ],
    status: {
      type: String,
      default: "Cancelled",
      enum: ["Cancelled", "Succeed"],
    },
    total: Number,
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
