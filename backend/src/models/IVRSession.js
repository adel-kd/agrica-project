const mongoose = require("mongoose");

const ivrSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    callerNumber: { type: String, required: true, index: true },
    state: { type: String, required: true, default: "awaiting_intent" },
    intent: { type: String, default: "unknown" },
    language: { type: String, default: "amh" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("IVRSession", ivrSessionSchema);
