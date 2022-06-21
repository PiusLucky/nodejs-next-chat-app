const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    avatarImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/11/19/14/28/bed-1839564__340.jpg",
    },
  },
  {
    timestamps: true,
    collection: "User",
  }
);

module.exports = mongoose.model("Users", userSchema);
