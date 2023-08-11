const mongoose = require("mongoose");

const postModel = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    readTime: {
      value: {
        type: String,
      },
      unit: {
        type: String,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    content: {
      type: String,
      required: true,
    },
    comment : [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    }]
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("Posts", postModel, "Post");