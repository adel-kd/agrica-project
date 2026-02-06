const { detectIntent } = require("./gemini.service");

const keywordIntent = (text) => {
  const normalized = text.toLowerCase();
  if (normalized.includes("register") || normalized.includes("ምዝገባ") || normalized.includes("መመዝገብ")) {
    return "register_farmer";
  }
  if (normalized.includes("sell") || normalized.includes("መሸጥ") || normalized.includes("ገበያ")) {
    return "sell_crops";
  }
  if (normalized.includes("price") || normalized.includes("ዋጋ") || normalized.includes("ገንዘብ")) {
    return "check_prices";
  }
  if (normalized.includes("advice") || normalized.includes("ጥያቄ") || normalized.includes("ምክር")) {
    return "farming_advice";
  }
  return "unknown";
};

const detectFarmerIntent = async (text) => {
  const keyword = keywordIntent(text);
  if (keyword !== "unknown") {
    return { intent: keyword, confidence: "medium" };
  }

  try {
    const aiIntent = await detectIntent(text);
    return {
      intent: aiIntent.intent || "unknown",
      confidence: aiIntent.confidence_level || "low"
    };
  } catch (error) {
    return { intent: "unknown", confidence: "low", error };
  }
};

module.exports = { detectFarmerIntent };
