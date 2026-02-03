const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

module.exports.generateContent = async (prompt) => {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
};
