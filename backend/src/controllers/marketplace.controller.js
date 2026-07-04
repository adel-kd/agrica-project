const mongoose = require("mongoose");
const CropListing = require("../models/CropListing");
const { verifyCropImage } = require("../services/gemini.service");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/**
 * Hide phone numbers for unauthenticated users
 */
const sanitizeListing = (listing, isAuthenticated) => {
  const obj = listing.toObject
    ? listing.toObject()
    : { ...listing };

  if (!isAuthenticated) {
    if (obj.phoneNumber) {
      obj.phoneNumber = "Hidden (Log in to view)";
    }

    if (obj.farmer && obj.farmer.phoneNumber) {
      obj.farmer.phoneNumber = "Hidden (Log in to view)";
    }
  }

  return obj;
};

/**
 * GET ALL LISTINGS
 */
exports.getListings = async (req, res) => {
  try {
    const filter = {};

    if (
      req.query.farmerId &&
      isValidObjectId(req.query.farmerId)
    ) {
      filter.farmer = req.query.farmerId;
    }

    if (req.query.cropType) {
      filter.cropType = {
        $regex: req.query.cropType.trim(),
        $options: "i"
      };
    }

    if (req.query.location) {
      filter.location = {
        $regex: req.query.location.trim(),
        $options: "i"
      };
    }

    if (req.query.verified === "true") {
      filter.qualityBadge = true;
    }

    const listings = await CropListing.find(filter)
      .populate(
        "farmer",
        "fullName phoneNumber region woreda verifiedFarmer"
      )
      .sort({ createdAt: -1 });

    const isAuthenticated = !!req.user;

    const sanitized = listings.map((listing) =>
      sanitizeListing(listing, isAuthenticated)
    );

    res.json(sanitized);
  } catch (err) {
    console.error("Fetch listings error:", err);
    res.status(500).json({
      error: "Failed to fetch listings"
    });
  }
};

/**
 * GET SINGLE LISTING
 */
exports.getListingById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid listing ID"
      });
    }

    const listing = await CropListing.findById(
      req.params.id
    ).populate(
      "farmer",
      "fullName phoneNumber region woreda verifiedFarmer"
    );

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    const isAuthenticated = !!req.user;
    const sanitized = sanitizeListing(
      listing,
      isAuthenticated
    );

    res.json(sanitized);
  } catch (err) {
    console.error("Fetch listing by ID error:", err);
    res.status(500).json({
      error: "Failed to fetch listing"
    });
  }
};

/**
 * CREATE LISTING (Supports standard Web App & Standalone Voice Agent flows)
 */
exports.createListing = async (req, res) => {
  try {
    const {
      cropType,
      quantity,
      unit,
      expectedPrice,
      location,
      harvestDate,
      phoneNumber // 🎙️ Capture phone number parameter if provided by voice agent
    } = req.body;

    if (
      !cropType ||
      !quantity ||
      !expectedPrice ||
      !location
    ) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const farmer = req.user;

    // 💡 CONDITIONAL AGENT LOGIC: Build metadata safe for your DB Schema and UI
    const finalFarmerId = farmer ? farmer._id : new mongoose.Types.ObjectId(); 
    const finalFarmerName = farmer ? farmer.fullName : "Unknown Farmer (Voice Agent)";
    const finalPhoneNumber = phoneNumber || req.body.phone || (farmer ? farmer.phoneNumber : "No Phone Provided");

    // Cloudinary URLs handling
    const imageFiles = req.files || [];
    const imageUrls = imageFiles.map((file) => file.path);

    let verificationStatus = "unverified";
    let score = 0;
    let successMessage = "";

    // Run Gemini check ONLY if an image is actually uploaded
    if (imageUrls.length > 0) {
      const result = await verifyCropImage(
        imageUrls[0],
        cropType
      );

      if (!result.detected_crop) {
        return res.status(400).json({
          error: "Uploaded image is not recognized as a crop"
        });
      }

      if (!result.matches_crop) {
        verificationStatus = "failed";
        score = result.confidence || 0;
        successMessage = "Crop does not match listing type";
      } else if (!result.is_clear) {
        return res.status(400).json({
          error: "Low-resolution image. Please upload a clearer one"
        });
      } else {
        verificationStatus = "verified";
        score = result.confidence || 100;
        successMessage = "Congratulations! Your crop received a quality badge";

        if (farmer) {
          farmer.verifiedFarmer = true;
          await farmer.save();
        }
      }
    } else {
      // If voice agent submits without images, default message setup
      successMessage = "Listing created successfully via voice";
    }

    const listing = await CropListing.create({
      // 💡 If unauthenticated, pass the random ID so populate doesn't completely break, or null depending on your schema strictness
      farmer: farmer ? farmer._id : null, 
      farmerName: finalFarmerName,
      phoneNumber: finalPhoneNumber,

      cropType,
      quantity: Number(quantity),
      unit: unit || "kg",
      expectedPrice: Number(expectedPrice),
      location,
      harvestDate:
        harvestDate ||
        new Date().toISOString().split("T")[0],

      images: imageUrls,

      isGeminiVerified: verificationStatus === "verified",
      qualityBadge: verificationStatus === "verified",

      verification: {
        status: verificationStatus,
        score,
        reasons:
          verificationStatus === "verified"
            ? [
                "AI quality check passed",
                "Matches listed crop type"
              ]
            : ["No image provided for validation"]
      }
    });

    // Populate operation
    let populated = null;
    if (listing.farmer) {
      populated = await CropListing.findById(listing._id).populate(
        "farmer",
        "fullName phoneNumber region woreda verifiedFarmer"
      );
    } else {
      populated = listing;
    }

    res.status(201).json({
      message: successMessage,
      listing: populated
    });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({
      error: "Create failed"
    });
  }
};

/**
 * UPDATE LISTING
 */
exports.updateListing = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid listing ID"
      });
    }

    const listing = await CropListing.findById(
      req.params.id
    );

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        error: "Unauthorized to update this listing"
      });
    }

    listing.cropType = req.body.cropType || listing.cropType;
    listing.quantity = Number(req.body.quantity) || listing.quantity;
    listing.unit = req.body.unit || listing.unit;
    listing.expectedPrice = Number(req.body.expectedPrice) || listing.expectedPrice;
    listing.location = req.body.location || listing.location;
    listing.harvestDate = req.body.harvestDate || listing.harvestDate;

    await listing.save();

    res.json({
      message: "Listing updated successfully",
      listing
    });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({
      error: "Update failed"
    });
  }
};

/**
 * DELETE LISTING
 */
exports.deleteListing = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid listing ID"
      });
    }

    const listing = await CropListing.findById(
      req.params.id
    );

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        error: "Unauthorized to delete this listing"
      });
    }

    await CropListing.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Listing deleted successfully"
    });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({
      error: "Delete failed"
    });
  }
};