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
router.post("/listings", createListing);

// AI verification endpoint
router.patch("/listings/:id/verify", verifyListing);

module.exports = router;

