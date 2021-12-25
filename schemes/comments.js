const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentsList = new Schema(
  {
    comment: { type: String, required: true },
    name: { type: String, required: true }
  },
  { collection: "commentsList" }
);

module.exports = comments = mongoose.model("comments", commentsList);