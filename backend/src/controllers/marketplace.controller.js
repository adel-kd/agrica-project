const CropListing = require("../models/CropListing");
const Farmer = require("../models/Farmer");
const { logInfo, logError } = require("../utilis/logger");

/**
 * GET /api/market/listings
 * Public marketplace listings for buyers.
 * Supports optional filtering via query params.
 */
exports.getListings = async (req, res, next) => {
  try {
    const { cropType, location, verified } = req.query;

    const filter = { status: "active" };
    if (cropType) {
      filter.cropType = new RegExp(cropType, "i");
    }
    if (location) {
      filter.location = new RegExp(location, "i");
    }
    if (verified === "true") {
      filter["verification.status"] = "verified";
    }

    const listings = await CropListing.find(filter)
      .sort({ createdAt: -1 })
      .populate("farmer", "fullName region woreda preferredLanguage");

    logInfo("Fetched marketplace listings", {
      count: listings.length,
      cropType,
      location,
      verified
    });

    res.json(listings);
  } catch (err) {
    logError("Failed to fetch listings", { error: err.message });
    next(err);
  }
};

/**
 * GET /api/market/listings/:id
 * Single listing details.
 */
exports.getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await CropListing.findById(id).populate(
      "farmer",
      "fullName region woreda preferredLanguage"
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (err) {
    logError("Failed to fetch listing by id", { error: err.message, id: req.params.id });
    next(err);
  }
};



// const { generateContent } = require("../config/gemini"); // Now using service wrapper if available or config directly
const { generateRawContent } = require("../config/gemini");
const fs = require("fs");
const path = require("path");

/**
 * PATCH /api/market/listings/:id/verify
 * Trigger verification manually.
 */
exports.verifyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await CropListing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Determine verification status based on existing data or re-trigger logic
    // For now, we'll confirm it's verified if it has images, else unverified
    let verificationStatus = listing.verification.status;

    if (listing.images && listing.images.length > 0) {
      // Here we could re-call verifyCropImage if we had the file path
      // For now, let's just mark it as pending manual review or verified
      verificationStatus = "pending_review";
    }

    listing.verification.status = verificationStatus;
    await listing.save();

    res.json({ message: "Verification status updated", listing });
  } catch (err) {
    logError("Failed to verify listing", { error: err.message, id: req.params.id });
    next(err);
  }
};

/**
 * Helper to verify crop image using Gemini
 */
async function verifyCropImage(imagePath, cropType) {
  try {
    const mimeType = "image/jpeg"; // Simplified, should detect from file
    const imageData = fs.readFileSync(imagePath).toString("base64");

    const prompt = `
    You are an agricultural expert. Verify if this image shows: ${cropType}.
    Respond/Return ONLY valid JSON:
    {
      "is_valid_crop": boolean,
      "confidence": 0-100,
      "quality_comment": "string"
    }
    `;

    const response = await generateRawContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageData } }
        ]
      }]
    });

    const text = response.text;
    const json = JSON.parse(text.replace(/```json|```/g, ""));
    return json;
  } catch (e) {
    logError("Gemini Image Verification Failed", e);
    return null;
  }
}

/**
 * POST /api/market/listings
 * Create a listing from the web app (farmer with internet).
 * Supports image upload.
 */
exports.createListing = async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      region,
      woreda,
      cropType,
      quantity,
      unit,
      expectedPrice,
      location,
      harvestDate
    } = req.body;

    // files are in req.files
    const imageFiles = req.files || [];
    const imageUrls = imageFiles.map(f => `/uploads/${f.filename}`); // Simple logic, assumes static serve

    if (
      !fullName ||
      !phoneNumber ||
      !region ||
      !woreda ||
      !cropType ||
      !quantity ||
      !unit ||
      !expectedPrice ||
      !location ||
      !harvestDate
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(expectedPrice);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive number" });
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "Expected price must be a positive number" });
    }

    const allowedUnits = ["kg", "quintal"];
    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({ error: "Unit must be either 'kg' or 'quintal'" });
    }

    const farmer = await Farmer.findOneAndUpdate(
      { phoneNumber },
      { fullName, phoneNumber, region, woreda, preferredLanguage: "am" },
      { upsert: true, new: true }
    );

    // Initial Verification Check
    let verificationStatus = "unverified";
    let verificationScore = 0;
    let verificationReasons = [];

    if (imageFiles.length > 0) {
      // Verify the first image
      const verifyResult = await verifyCropImage(imageFiles[0].path, cropType);
      if (verifyResult && verifyResult.is_valid_crop && verifyResult.confidence > 70) {
        verificationStatus = "verified";
        verificationScore = verifyResult.confidence;
        verificationReasons.push(verifyResult.quality_comment);
      } else if (verifyResult) {
        verificationReasons.push(verifyResult.quality_comment || "Image does not match crop type");
      }
    }

    const listing = await CropListing.create({
      farmer: farmer._id,
      phoneNumber,
      cropType,
      quantity: parsedQuantity,
      unit,
      expectedPrice: parsedPrice,
      location,
      harvestDate,
      images: imageUrls,
      source: "web",
      verification: {
        status: verificationStatus,
        score: verificationScore,
        reasons: verificationReasons
      }
    });

    logInfo("Web listing created", { listingId: listing._id, phoneNumber, verificationStatus });

    res.status(201).json(listing);
  } catch (err) {
    logError("Failed to create listing", { error: err.message });
    next(err);
  }
};

