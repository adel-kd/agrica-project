const express = require("express");
const router = express.Router();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require("../controllers/marketplace.controller");

const auth = require("../middleware/auth");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agrica-crops",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

router.get("/listings", auth.optionalAuth, getListings);
router.get("/listings/:id", auth.optionalAuth, getListingById);

router.post(
  "/listings",
  auth.requireAuth,
  upload.array("images", 3),
  createListing
);

router.patch("/listings/:id", auth.requireAuth, updateListing);
router.delete("/listings/:id", auth.requireAuth, deleteListing);

module.exports = router;