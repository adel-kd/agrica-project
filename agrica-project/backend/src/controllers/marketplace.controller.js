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

/**
 * POST /api/market/listings
 * Create a listing from the web app (farmer with internet).
 * For now this is unauthenticated and keyed by phoneNumber.
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
      harvestDate,
      images
    } = req.body;

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

    const listing = await CropListing.create({
      farmer: farmer._id,
      phoneNumber,
      cropType,
      quantity: parsedQuantity,
      unit,
      expectedPrice: parsedPrice,
      location,
      harvestDate,
      images: Array.isArray(images) ? images : [],
      source: "web"
    });

    logInfo("Web listing created", { listingId: listing._id, phoneNumber });

    res.status(201).json(listing);
  } catch (err) {
    logError("Failed to create listing", { error: err.message });
    next(err);
  }
};

/**
 * PATCH /api/market/listings/:id/verify
 * Trigger AI-powered verification and update verification status.
 * For now, this is a simple text-based verification stub that can
 * be extended to use images later.
 */
const { generateContent } = require("../config/gemini");

exports.verifyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await CropListing.findById(id).populate(
      "farmer",
      "fullName region woreda preferredLanguage"
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Build a concise description for Gemini
    const description = `
You are AGRICA AI, an honest agricultural marketplace verifier.

Task:
- Evaluate how realistic and trustworthy this crop listing sounds.
- Return ONLY valid JSON with:
{
  "score": 0-100,
  "quality_label": "low" | "medium" | "high",
  "reasons": []
}

Listing data:
- Farmer: ${listing.farmer?.fullName || "Unknown"}
- Phone: ${listing.phoneNumber}
- Crop: ${listing.cropType}
- Quantity: ${listing.quantity} ${listing.unit}
- Expected price: ${listing.expectedPrice}
- Location: ${listing.location}
- Harvest date: ${listing.harvestDate}
- Source: ${listing.source}
`;

    const text = await generateContent(description);

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {
        score: 50,
        quality_label: "medium",
        reasons: ["Automatic verification failed, using default score"]
      };
    }

    const score = Number(payload.score) || 0;
    const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
    const status = score >= 70 ? "verified" : "unverified";

    listing.verification = {
      status,
      score,
      reasons
    };

    await listing.save();

    logInfo("Listing verified", { listingId: listing._id, score, status });

    res.json(listing);
  } catch (err) {
    logError("Failed to verify listing", { error: err.message, id: req.params.id });
    next(err);
  }
};

