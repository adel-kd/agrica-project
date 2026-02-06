const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  processMessage,
  chatAgronomist,
  analyzeImage,
  analyzeVideo
} = require("../controllers/ai.controller");

// Text-only AI processing (simple mode)
router.post("/ask", processMessage);

// Advanced chat for web users
router.post("/chat", chatAgronomist);

// Image-based diagnosis
const uploadImage = multer({ storage: multer.memoryStorage() });
router.post("/image", uploadImage.single("file"), analyzeImage);

// Video pipeline stub (accept file, not fully processed yet)
const uploadVideo = multer({ storage: multer.memoryStorage() });
router.post("/video", uploadVideo.single("file"), analyzeVideo);

module.exports = router;
