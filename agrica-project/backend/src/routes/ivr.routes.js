const express = require("express");
const router = express.Router();

const {
  ivrEntry,
  ivrRecording
} = require("../controllers/ivr.controller");

// Africa’s Talking IVR entry point
router.post("/ivr", ivrEntry);

// Recording callback
router.post("/ivr/recording", ivrRecording);

module.exports = router;
