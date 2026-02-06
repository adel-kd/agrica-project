require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const getHasabConfig = () => {
  const baseUrl = process.env.HASAB_BASE_URL;
  const apiKey = process.env.HASAB_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("HASAB env variables not loaded. Please set HASAB_BASE_URL and HASAB_API_KEY in .env");
  }

  return {
    baseUrl,
    apiKey,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    }
  };
};

// 🎤 Speech → Text
async function transcribeAudio(filePath, sourceLanguage = "amh") {
  const { baseUrl, headers } = getHasabConfig();

  console.log(`🎙️ [Hasab STT] Starting transcription for ${filePath}...`);


  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath)); // Docs say "file"
  form.append("transcribe", "true");
  form.append("translate", "false");
  form.append("summarize", "false");
  form.append("language", "auto"); // Docs say target language default auto
  form.append("source_language", sourceLanguage); // Docs say source_language (e.g., amh)
  form.append("timestamps", "false");

  try {
    const requestHeaders = { ...headers, ...form.getHeaders() };
    console.log("Hasab Request Headers:", JSON.stringify(requestHeaders, null, 2));

    const response = await axios.post(`${baseUrl}/v1/upload-audio`, form, {
      headers: requestHeaders,
      timeout: 120000
    });

    console.log("📥 [Hasab STT] Response received:", JSON.stringify(response.data, null, 2));

    if (response.data?.transcription) {
      return response.data.transcription;
    }

    throw new Error(`Transcription failed. Response: ${JSON.stringify(response.data)}`);
  } catch (err) {
    if (err.response) {
      console.error("Hasab Error Details:", JSON.stringify(err.response.data, null, 2));
    }
    throw new Error(err.response?.data?.message || err.message || "Unknown transcription error");
  }
}

// 🔊 Text → Speech with Google TTS Fallback for "Real AI" feel
async function textToSpeech(text, options = {}) {
  const { language = "am", savePath } = options;

  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  try {
    // 1. Try Hasab first (if not in forced mock mode)
    if (process.env.MOCK_MODE !== "true") {
      try {
        console.log("🎙️ [Hasab] Calling real TTS API...");
        const { baseUrl, headers } = getHasabConfig();
        const response = await axios.post(
          `${baseUrl}/v1/tts/synthesize`,
          { text, language: "amh", speaker_name: "selam" },
          { headers: { ...headers, "Content-Type": "application/json" }, timeout: 10000 }
        );
        if (response.data?.audio_url) {
          const audioUrl = response.data.audio_url;
          if (savePath) {
            const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path.resolve(savePath), audioResponse.data);
          }
          return audioUrl;
        }
      } catch (e) {
        console.warn("⚠️ Hasab TTS failed, falling back to Google TTS:", e.message);
      }
    }

    // 2. FALLBACK/PRIMARY: Google TTS (High Quality AI Voice)
    // This is great for hackathons as it sounds very "AI"
    console.log("🎙️ [Google TTS] Generating AI Voice URL...");
    const encodedText = encodeURIComponent(text);
    // Note: We use the direct google translate TTS URL which returns high quality speech
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=am&client=tw-ob`;

    if (savePath) {
      const response = await axios.get(googleTtsUrl, {
        responseType: "arraybuffer",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      fs.writeFileSync(path.resolve(savePath), response.data);
      console.log("✅ [Google TTS] Saved to:", savePath);
    }

    return googleTtsUrl;

  } catch (err) {
    console.error("❌ TTS Error Details:", err.response?.data || err.message || err);
    throw new Error(`Failed to generate AI voice: ${err.message || "Unknown error"}`);
  }
}

module.exports = { transcribeAudio, textToSpeech };
