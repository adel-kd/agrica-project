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

  try {
    return JSON.parse(text);
  } catch {
    return {
      language_detected: "",
      intent: "general_advice",
      confidence_level: "low",
      response_for_farmer: typeof text === "string" ? text : JSON.stringify(text),
      follow_up_questions: []
    };
  }
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

  try {
    return JSON.parse(text);
  } catch {
    return {
      language_detected: "",
      intent: "unknown",
      confidence_level: "low",
      response_for_farmer: typeof text === "string" ? text : JSON.stringify(text),
      follow_up_questions: []
    };
  }
};
