const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/ai.routes");
const ivrRoutes = require("./routes/ivr.routes");
const marketRoutes = require("./routes/market.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// IVR entrypoints (Africa's Talking)
app.use("/api", ivrRoutes);

// AI agronomist endpoints (web + IVR helper)
app.use("/api/ai", aiRoutes);

// Marketplace (farmers + buyers)
app.use("/api/market", marketRoutes);

app.get("/", (_, res) => res.send("AGRICA backend running"));

// Centralized error handling
app.use(errorHandler);

module.exports = app;
