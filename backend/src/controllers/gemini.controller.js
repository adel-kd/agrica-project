const ChatSession = require("../models/ChatSession");
const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");
const { logError } = require("../utilis/logger");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_DIRECTIVE = `
You are the AGRICA Agronomist, a senior agricultural expert.
Always respond in Amharic (አማርኛ).
If the user provides details about a crop harvest listing they want to publish 
(such as farmer name, crop type, quantity, price, location), you MUST output 
this exact JSON block at the end of your response:

{
  "action": "CREATE_LISTING",
  "data": {
    "farmer_name": "...",
    "crop_type": "...",
    "quantity": "...",
    "price": "...",
    "location": "..."
  }
}

Do not change the keys of this JSON. Make sure the JSON is valid.
`;

const fileToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    }
  };
};

const extractListingPayload = (responseText) => {
  const jsonMatch = responseText.match(
    /(\{[\s\S]*"action"\s*:\s*"CREATE_LISTING"[\s\S]*\})/
  );

  if (!jsonMatch) {
    return {
      cleanedResponse: responseText,
      payload: null
    };
  }

  let payload = null;

  try {
    payload = JSON.parse(jsonMatch[1]);
  } catch (err) {
    logError("Failed to parse CREATE_LISTING JSON block", {
      error: err.message
    });
  }

  const cleanedResponse = responseText
    .replace(jsonMatch[0], "")
    .replace(/```json|```/g, "")
    .trim();

  return {
    cleanedResponse,
    payload
  };
};

// POST /api/v1/ai/chat
exports.chat = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({
        error: "userId and prompt are required"
      });
    }

    let contents = [];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const session = await ChatSession.findOne({ userId });

      if (session && session.messages) {
        contents = session.messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_DIRECTIVE,
        temperature: 0.5
      }
    });

    const responseText = response.text;

    const { cleanedResponse } = extractListingPayload(responseText);

    if (mongoose.Types.ObjectId.isValid(userId)) {
      await ChatSession.findOneAndUpdate(
        { userId },
        {
          $push: {
            messages: [
              {
                role: "user",
                content: prompt
              },
              {
                role: "assistant",
                content: cleanedResponse
              }
            ]
          }
        },
        {
          new: true,
          upsert: true
        }
      );
    }

    res.json({
      reply: cleanedResponse
    });
  } catch (err) {
    logError("Gemini chat failed", {
      error: err.message
    });

    res.status(500).json({
      error: "Gemini Service Error"
    });
  }
};

// GET /api/v1/ai/history/:userId
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const session = await ChatSession.findOne({ userId });

    res.json({
      messages: session?.messages || []
    });
  } catch (err) {
    logError("Failed to fetch chat history", {
      error: err.message
    });

    res.status(500).json({
      error: "Failed to fetch chat history"
    });
  }
};

// POST /api/v1/ai/verify-crop
exports.verifyCrop = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "Image file is required"
      });
    }

    const imagePart = fileToGenerativePart(
      file.buffer,
      file.mimetype
    );

    const promptInstruction = `
Analyze this image carefully as an expert agricultural agronomist.

1. Determine if this image contains a plant, agricultural crop, crop disease, fruit, vegetable, or farm harvest.
2. If it is NOT a crop/plant, respond exactly in Amharic:
"ይህ ምስል የሰብል ወይም የዕፅዋት ምስል አይደለም። እባክዎ ትክክለኛ የሰብል ፎቶ ያንሱ። HEALTH_SCORE: 0"

3. If it IS a crop/plant, provide a full health diagnosis in Amharic.
4. End with:
HEALTH_SCORE: [1-100]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [imagePart, promptInstruction]
    });

    const responseText = response.text;

    let score = 70;

    const scoreMatch = responseText.match(
      /HEALTH_SCORE:\s*(\d+)/i
    );

    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
    }

    const cleanedDiagnosis = responseText
      .replace(/HEALTH_SCORE:\s*\d+/i, "")
      .trim();

    res.json({
      healthScore: score,
      response_text: cleanedDiagnosis
    });
  } catch (err) {
    logError("Gemini vision failed", {
      error: err.message
    });

    res.status(500).json({
      error: "Gemini Vision Processing Error"
    });
  }
};