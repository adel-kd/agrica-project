const express = require("express");
const cors = require("cors");

const geminiRoutes = require("./routes/gemini.routes");
const marketRoutes = require("./routes/market.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/ai", geminiRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("AGRICA backend running");
});

app.use(errorHandler);

module.exports = app;