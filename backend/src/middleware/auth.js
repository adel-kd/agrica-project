const Farmer = require("../models/Farmer");

/**
 * Extracts user ID from the authorization header if valid.
 */
const getUserIdFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  // Handle dummy-token-jwt-<userId> format
  if (token.startsWith("dummy-token-jwt-")) {
    return token.replace("dummy-token-jwt-", "");
  }
  
  // Return token as-is if it's already a raw ID
  return token;
};

/**
 * Middleware that requires a valid user token.
 */
exports.requireAuth = async (req, res, next) => {
  try {
    const userId = getUserIdFromHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Access denied. No valid token provided." });
    }

    const user = await Farmer.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("RequireAuth middleware error:", err);
    res.status(500).json({ error: "Authentication failed." });
  }
};

/**
 * Middleware that optionally identifies the user if a token is present, but doesn't fail if not.
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const userId = getUserIdFromHeader(req.headers.authorization);
    if (userId) {
      const user = await Farmer.findById(userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    console.error("OptionalAuth middleware error:", err);
    next();
  }
};
