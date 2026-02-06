const express = require("express");
const router = express.Router();

const {
  ivrEntry,
  ivrRecording,
  initiateCall,
  ivrWebhook
} = require("../controllers/ivr.controller");

// Africa’s Talking IVR entry point (Deprecated)
router.post("/ivr", ivrEntry);

// Recording callback (Deprecated)
router.post("/ivr/recording", ivrRecording);

// Infobip Outbound Call Trigger
router.post("/ivr/call", initiateCall);

// Infobip Webhook
router.post("/ivr/webhook", ivrWebhook);

module.exports = router;
