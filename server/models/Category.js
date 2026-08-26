const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Category",
  new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true },
      description: String,
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true },
  ),
);
