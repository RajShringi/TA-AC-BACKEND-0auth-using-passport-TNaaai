const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    username: { type: String, required: true, unique: true },
    photo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
