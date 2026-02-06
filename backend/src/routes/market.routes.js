const express = require("express");
const router = express.Router();

const {
  getListings,
  getListingById,
  createListing,
  verifyListing
} = require("../controllers/marketplace.controller");

// Public marketplace listing endpoints
router.get("/listings", getListings);
router.get("/listings/:id", getListingById);

// Farmer listing creation from web app
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Save to disk for persistence (or use memory if preferred, but listings need persistence)
router.post("/listings", upload.array("images", 3), createListing);

// AI verification endpoint
router.patch("/listings/:id/verify", verifyListing);

module.exports = router;

