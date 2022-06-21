const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      content: { type: String },
    },
    image: {
      url: { type: String },
    },
    offerId: {
      type: String,
      required: true,
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Trade Chat Collection",
  }
);

module.exports = mongoose.model("Message", MessageSchema);
