const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  text: { type: String, required: true, trim: true },
});

module.exports = mongoose.model("chat", chatSchema);