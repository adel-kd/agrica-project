const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require("../controllers/marketplace.controller");

const auth = require("../middleware/auth");

router.get("/listings", auth.optionalAuth, getListings);
router.get("/listings/:id", auth.optionalAuth, getListingById);

router.post("/listings", auth.requireAuth, upload.array("images", 3), createListing);

router.patch("/listings/:id", auth.requireAuth, updateListing);

router.delete("/listings/:id", auth.requireAuth, deleteListing);

module.exports = router;