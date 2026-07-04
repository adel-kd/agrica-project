const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
