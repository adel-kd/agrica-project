const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

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

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};