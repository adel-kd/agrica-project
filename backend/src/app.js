const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/ai.routes");
const ivrRoutes = require("./routes/ivr.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/api", ivrRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (_, res) => res.send("IVR running"));

app.use(errorHandler);


module.exports = app;
