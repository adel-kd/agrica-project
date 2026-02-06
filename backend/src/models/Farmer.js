const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    region: { type: String, required: true, trim: true },
    woreda: { type: String, required: true, trim: true },
    preferredLanguage: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "farmer", enum: ["farmer", "buyer", "admin"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
