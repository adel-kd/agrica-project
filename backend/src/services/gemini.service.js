const { generateContent } = require("../config/gemini");

exports.askGemini = async (message) => {
  const prompt = `
Respond ONLY in valid JSON.

{
  "language_detected": "",
  "intent": "crop_diagnosis | weather | market_price | general_advice",
  "confidence_level": "low | medium | high",
  "response_for_farmer": "",
  "follow_up_questions": []
}

User message:
"${message}"
`;

  const text = await generateContent(prompt);
  return JSON.parse(text);
};

exports.detectIntent = async (message) => {
  const prompt = `
Respond ONLY in valid JSON.

{
  "language_detected": "",
  "intent": "farming_advice | sell_crops | register_farmer | check_prices | unknown",
  "confidence_level": "low | medium | high",
  "response_for_farmer": "",
  "follow_up_questions": []
}

User message:
"${message}"
`;

  const text = await generateContent(prompt);
  return JSON.parse(text);
};
