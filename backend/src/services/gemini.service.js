const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const fileToGenerativePart = async (
  imageUrl,
  mimeType = "image/jpeg"
) => {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer"
  });

  return {
    inlineData: {
      data: Buffer.from(response.data).toString("base64"),
      mimeType
    }
  };
};

exports.verifyCropImage = async (
  imageUrl,
  cropType
) => {
  try {
    const imagePart =
      await fileToGenerativePart(imageUrl);

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          imagePart,
          `
Analyze this crop image.

Expected crop: ${cropType}

Rules:
1. Check if the image is actually a crop, plant, farm produce, or agricultural product. Respond with "yes" for IS_VALID_CROP only if it represents an actual crop or plant. Otherwise respond with "no".

2. Check if the crop in the image matches the expected crop type: "${cropType}". Respond with "yes" for MATCHES_CROP only if it matches "${cropType}". Otherwise respond with "no".

3. Check if the image is clear and of sufficient resolution (not blurry, not extremely low-resolution, not hard to see details). Respond with "clear" for IMAGE_QUALITY if it is clear and of good resolution. Otherwise respond with "unclear".

4. Give confidence from 1-100.

Respond ONLY in this format:

IS_VALID_CROP: yes/no
MATCHES_CROP: yes/no
IMAGE_QUALITY: clear/unclear
CONFIDENCE: number
QUALITY_COMMENT: short explanation
`
        ]
      });

    const text = response.text;

    const isValidCrop =
      /IS_VALID_CROP:\s*yes/i.test(text);

    const matchesCrop =
      /MATCHES_CROP:\s*yes/i.test(text);

    const isClear =
      /IMAGE_QUALITY:\s*clear/i.test(text);

    const confidenceMatch =
      text.match(/CONFIDENCE:\s*(\d+)/i);

    const commentMatch =
      text.match(/QUALITY_COMMENT:\s*(.*)/i);

    return {
      detected_crop: isValidCrop,
      matches_crop: matchesCrop,
      is_clear: isClear,
      is_valid_crop:
        isValidCrop && matchesCrop && isClear,
      confidence: confidenceMatch
        ? parseInt(confidenceMatch[1])
        : 0,
      quality_comment: commentMatch
        ? commentMatch[1].trim()
        : "No comment"
    };
  } catch (error) {
    console.error(
      "Gemini verification error:",
      error
    );

    return {
      is_valid_crop: false,
      confidence: 0,
      quality_comment: "Verification failed"
    };
  }
};