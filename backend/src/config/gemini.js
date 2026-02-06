const { GoogleGenAI } = require("@google/genai");

let client;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Set it in your environment before calling Gemini features.");
  }

  client = new GoogleGenAI({ apiKey });
  return client;
};

/**
 * Convenience helper for simple text prompts.
 * Uses Gemini 2.5 Flash and returns the aggregated text.
 */
const generateContent = async (prompt) => {
  const geminiClient = getClient();
  const response = await geminiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
};

/**
 * Low-level wrapper that accepts the full generateContent options.
 * Use this for multimodal (image/video) or custom model calls.
 */
const generateRawContent = async (options) => {
  const geminiClient = getClient();
  return geminiClient.models.generateContent(options);
};

module.exports = {
  getClient,
  generateContent,
  generateRawContent
};
