const express = require("express");
const router = express.Router();
const { processMessage } = require("../controllers/ai.controller");

router.post("/ask", processMessage);

module.exports = router;
