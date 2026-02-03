require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🔹 Load Hasab API base URL and key from environment variables
const BASE_URL = process.env.HASAB_BASE_URL;
const API_KEY = process.env.HASAB_API_KEY;

if (!BASE_URL || !API_KEY) {
  throw new Error("HASAB env variables not loaded. Please set HASAB_BASE_URL and HASAB_API_KEY in .env");
}

// 🔹 Common headers
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: "application/json",
};

// 🎤 Speech → Text
async function transcribeAudio(filePath, sourceLanguage = "amh") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath));
  form.append("transcribe", "true");
  form.append("translate", "false");
  form.append("summarize", "false");
  form.append("language", sourceLanguage);
  form.append("timestamp", "true"); // optional

  try {
    const response = await axios.post(`${BASE_URL}/upload-audio`, form, {
      headers: { ...headers, ...form.getHeaders() },
      timeout: 120000, // 2 min timeout
    });

    if (response.data?.transcription) {
      return response.data.transcription;
    } else {
      throw new Error(`Transcription failed. Response: ${JSON.stringify(response.data)}`);
    }
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Unknown transcription error");
  }
}

// 🔊 Text → Speech with optional local saving
async function textToSpeech(text, options = {}) {
  const { language = "amh", speaker = "selam", savePath } = options;

  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  try {
    // 1️⃣ Generate TTS URL from Hasab
    const response = await axios.post(
      `${BASE_URL}/v1/tts/synthesize`,
      { text, language, speaker_name: speaker },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 60000,
      }
    );

    console.log("Full TTS response:", response.data);

    if (!response.data?.audio_url) {
      throw new Error(`TTS response did not return audio_url. Message: ${response.data.message || "unknown"}`);
    }

    const audioUrl = response.data.audio_url;

    // 2️⃣ Optionally download and save locally
    if (savePath) {
      const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
      const outputFile = path.resolve(savePath);
      fs.writeFileSync(outputFile, audioResponse.data);
      console.log(`Audio saved to ${outputFile}`);
    }

    // 3️⃣ Return the audio URL anyway
    return audioUrl;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Unknown TTS error");
  }
}

module.exports = { transcribeAudio, textToSpeech };
