require("dotenv").config();
const path = require("path"); // ✅ Add this
const { transcribeAudio, textToSpeech } = require("../services/hasab.service");

(async () => {
  try {
    const audioPath = path.join(process.cwd(), "uploads", "input.wav");

    console.log("🎧 Transcribing...");
    const text = await transcribeAudio(audioPath, "amh");
    console.log("📝 STT Result:", text);

    console.log("🔊 Converting text to speech...");
    const audioUrl = await textToSpeech(text, { language: "amh", speaker: "selam", savePath: "./output.mp3" });
    console.log("✅ TTS URL (copy this to browser to listen):", audioUrl);

  } catch (err) {
    console.error("❌ Flow Error:", err.message);
  }
})();
