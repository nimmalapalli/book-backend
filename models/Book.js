const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Book",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      author: String,
      category: String,
      isbn: String,
      price: Number,
      rentalPrice: Number,
      rating: { type: Number, default: 0 },
      stock: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
      coverImage: String,
      description: String,
    },
    { timestamps: true },
  ),
);
