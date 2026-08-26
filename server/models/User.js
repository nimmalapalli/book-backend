const mongoose = require("mongoose");
module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, unique: true, required: true, lowercase: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["admin", "customer"], default: "customer" },
      status: { type: String, enum: ["active", "blocked"], default: "active" },
    },
    { timestamps: true },
  ),
);
