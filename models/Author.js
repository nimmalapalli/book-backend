const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Author",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      bio: String,
      books: Number,
      avatar: String,
    },
    { timestamps: true },
  ),
);
