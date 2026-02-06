const express = require("express");
const multer = require("multer");

const router = express.Router();

// Import ALL controllers in one destructure
const {
  processMessage,
  chatAgronomist,
  analyzeImage,
  analyzeVideo,
  handleVoiceChat
} = require("../controllers/ai.controller");

// Multer configs for file uploads
const uploadImage = multer({ storage: multer.memoryStorage() });
const uploadVideo = multer({ storage: multer.memoryStorage() });
const uploadAudio = multer({ storage: multer.memoryStorage() });

// Text-only AI processing (simple mode)
router.post("/ask", processMessage);

// Advanced chat for web users
router.post("/chat", chatAgronomist);

// Image-based diagnosis
router.post("/image", uploadImage.single("file"), analyzeImage);

// Video pipeline stub
router.post("/video", uploadVideo.single("file"), analyzeVideo);

// Voice Chat (Audio Blob)
router.post("/voice", uploadAudio.single("audio"), handleVoiceChat);

module.exports = router;

