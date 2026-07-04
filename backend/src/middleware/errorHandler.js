const { logError } = require("../utilis/logger");

const errorHandler = (err, req, res, next) => {
  logError("Unhandled error", { error: err.message, path: req.path });
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { detail: err.message } : {})
  });
};

module.exports = errorHandler;
