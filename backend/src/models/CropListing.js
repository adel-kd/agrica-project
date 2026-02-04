const mongoose = require("mongoose");

const cropListingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
    phoneNumber: { type: String, required: true, index: true },
    cropType: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    expectedPrice: { type: Number, required: true },
    location: { type: String, required: true, trim: true },
    harvestDate: { type: String, required: true, trim: true },
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CropListing", cropListingSchema);
