const { generateContent, generateRawContent } = require("../config/gemini");
const { logInfo, logError } = require("../utilis/logger");

/**
 * Legacy/simple text-only AI endpoint.
 */
exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
You are AGRICA AI, a senior African agronomist and agricultural marketplace assistant.

STRICT RULES:
- Respond ONLY in valid JSON
- No markdown
- No explanations
- No greetings

Parse the user message into:
{
  "language_detected": "",
  "intent": "",
  "confidence_level": "",
  "response_for_farmer": "",
  "follow_up_questions": []
}

User message:
"${message}"
`;

    const text = await generateContent(prompt);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch {
      jsonResponse = {
        language_detected: "",
        intent: "unknown",
        confidence_level: "low",
        response_for_farmer: text,
        follow_up_questions: []
      };
    }

    res.json(jsonResponse);
  } catch (error) {
    logError("AI /ask failed", { error: error.message });
    res.status(500).json({ error: "AI processing failed" });
  }
};

/**
 * POST /api/ai/chat
 * Advanced agronomist chat for web users.
 */
exports.chatAgronomist = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
You are AGRICA AI, a senior African agronomist helping smallholder farmers.

Requirements:
- Use simple, clear language.
- Prefer examples from African crops (teff, maize, wheat, coffee, etc.).
- Assume the farmer may not explain the problem clearly.
- Be practical and step-by-step.

If helpful, consider this previous context:
${context ? String(context).slice(0, 1000) : "none"}

User message:
"${message}"
`;

    const text = await generateContent(prompt);
    logInfo("AI chat response", { preview: String(text).slice(0, 120) });

    res.json({ reply: text });
  } catch (error) {
    logError("AI chat failed", { error: error.message });
    res.status(500).json({ error: "AI chat failed" });
  }
};

/**
 * POST /api/ai/image
 * Image-based crop diagnosis.
 * Expects multipart/form-data with field name "file".
 */
exports.analyzeImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const base64 = file.buffer.toString("base64");

    const response = await generateRawContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are AGRICA AI, a crop doctor for African farmers.

Task:
- Look at this crop image.
- Detect any diseases, pests, or nutrient deficiencies.
- Estimate overall crop health as a score between 0 and 100.
- Give clear treatment and prevention advice in simple language.

Respond ONLY in valid JSON:
{
  "diagnosis": "",
  "health_score": 0,
  "issues": [],
  "treatment": "",
  "prevention": ""
}
`
            },
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64
              }
            }
          ]
        }
      ]
    });

    const text = response.text;
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {
        diagnosis: text,
        health_score: 0,
        issues: [],
        treatment: "",
        prevention: ""
      };
    }

    res.json(payload);
  } catch (error) {
    logError("AI image analysis failed", { error: error.message });
    res.status(500).json({ error: "Image analysis failed" });
  }
};

/**
 * POST /api/ai/video
 * Video-based assessment stub.
 * For now, we just accept the video and return a placeholder response.
 */
exports.analyzeVideo = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    // Stub: in the future, extract frames and send to Gemini.
    logInfo("Received farm video for future analysis", {
      filename: file.originalname,
      size: file.size
    });

    res.json({
      status: "pending",
      message:
        "Video analysis pipeline is not fully implemented yet, but the upload worked. Use image analysis for now."
    });
  } catch (error) {
    logError("AI video analysis failed", { error: error.message });
    res.status(500).json({ error: "Video analysis failed" });
  }
};

