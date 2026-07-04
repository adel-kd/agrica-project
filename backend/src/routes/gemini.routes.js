const express = require("express");
const multer = require("multer");

const {
  chat,
  getChatHistory,
  verifyCrop
} = require("../controllers/gemini.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

router.post("/chat", chat);
router.get("/history/:userId", getChatHistory);

router.post(
  "/verify-crop",
  upload.single("cropImage"), // MUST match frontend
  verifyCrop
);

module.exports = router;