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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    }
  };
};

// 🎤 Speech → Text
async function transcribeAudio(filePath, sourceLanguage = "amh") {
  const { baseUrl, headers } = getHasabConfig();

  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath));
  form.append("transcribe", "true");
  form.append("translate", "false");
  form.append("summarize", "false");
  form.append("language", sourceLanguage);
  form.append("timestamp", "true");

  try {
    const response = await axios.post(`${baseUrl}/upload-audio`, form, {
      headers: { ...headers, ...form.getHeaders() },
      timeout: 120000
    });

    if (response.data?.transcription) {
      return response.data.transcription;
    }

    throw new Error(`Transcription failed. Response: ${JSON.stringify(response.data)}`);
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Unknown transcription error");
  }
}

// 🔊 Text → Speech with optional local saving
async function textToSpeech(text, options = {}) {
  const { baseUrl, headers } = getHasabConfig();
  const { language = "amh", speaker = "selam", savePath } = options;

  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/v1/tts/synthesize`,
      { text, language, speaker_name: speaker },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    if (!response.data?.audio_url) {
      throw new Error(`TTS response did not return audio_url. Message: ${response.data.message || "unknown"}`);
    }

    const audioUrl = response.data.audio_url;

    if (savePath) {
      const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
      const outputFile = path.resolve(savePath);
      fs.writeFileSync(outputFile, audioResponse.data);
    }

    return audioUrl;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Unknown TTS error");
  }
}

module.exports = { transcribeAudio, textToSpeech };
