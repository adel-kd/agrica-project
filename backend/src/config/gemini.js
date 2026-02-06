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
  try {
    const geminiClient = getClient();

    // In @google/genai (new SDK), use models.generateContent
    const result = await geminiClient.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // DEBUG: Log the full structure to see what's actually coming back
    console.log("🔍 [Gemini SDK] Full Result:", JSON.stringify(result, null, 2));

    // Common paths in various SDK versions
    const text = result.response?.text?.() ||
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.log("⚠️ [Gemini] No text extracted. Check 'Full Result' log above.");
      return null;
    }
    return text;
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
    return null;
  }
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
