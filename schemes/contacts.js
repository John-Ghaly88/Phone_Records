const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactsList = new Schema(
  {
    userID: { type: String , required: true },

    CName: { type: String, required: true },

    CNo: { type: String, required: true }
  },
  { collection: "contactsList" }
);

module.exports = contacts = mongoose.model("contacts", contactsList);
