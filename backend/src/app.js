const express = require("express");
const cors = require("cors");

const geminiRoutes = require("./routes/gemini.routes");
const marketRoutes = require("./routes/market.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// routes
app.use("/api/ai", geminiRoutes);

// IMPORTANT FIX: frontend expects /api/market/listings
app.use("/api/market", marketRoutes);

app.use("/api/auth", authRoutes);

// health check
app.get("/", (req, res) => {
  res.send("AGRICA backend running");
});

// error handler
app.use(errorHandler);

module.exports = app;
