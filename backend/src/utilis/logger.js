const logInfo = (message, meta = {}) => {
  console.log(`[INFO] ${message}`, meta);
};

const logError = (message, meta = {}) => {
  console.error(`[ERROR] ${message}`, meta);
};

module.exports = { logInfo, logError };
