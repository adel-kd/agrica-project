const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { transcribeAudio, textToSpeech } = require("../services/hasab.service");
const { askGemini } = require("../services/gemini.service");

/**
 * STEP 1: IVR entry point
 * Plays welcome message and records farmer voice
 */
exports.ivrEntry = async (req, res) => {
  res.set("Content-Type", "text/xml");

  res.send(`
    <Response>
      <Say language="am-ET">
        እንኳን ወደ አግሪካ የእርሻ ረዳት በደህና መጡ።
        ከቢፕ በኋላ ጥያቄዎን ይናገሩ።
      </Say>

      <Record
        maxLength="20"
        finishOnKey="#"
        callbackUrl="/api/ivr/recording"
      />
    </Response>
  `);
};

/**
 * STEP 2: Recording callback
 * Receives audio URL → STT → Gemini → TTS → plays answer
 */
exports.ivrRecording = async (req, res) => {
  try {
    const recordingUrl = req.body.recordingUrl;

    if (!recordingUrl) {
      throw new Error("No recording URL from Africa’s Talking");
    }

    const uploadDir = path.join(__dirname, "../uploads");
    const audioPath = path.join(uploadDir, "input.wav");

    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Download recording
    const audioResponse = await axios({
      url: recordingUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(audioPath);
    audioResponse.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        // 1️⃣ Speech → Text (Hasab STT)
        const text = await transcribeAudio(audioPath, "amh");

        // 2️⃣ AI reasoning (Gemini)
        const ai = await askGemini(text);

        // 3️⃣ Text → Speech (Hasab TTS)
        const audioUrl = await textToSpeech(
          ai.response_for_farmer || ai,
          "amh",
          "selam"
        );

        // 4️⃣ Play response
        res.set("Content-Type", "text/xml");
        res.send(`
          <Response>
            <Play>${audioUrl}</Play>
          </Response>
        `);

      } catch (err) {
        console.error("Processing error:", err);
        fallback(res);
      }
    });

  } catch (err) {
    console.error("IVR error:", err);
    fallback(res);
  }
};

/**
 * Fallback voice response
 */
function fallback(res) {
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Say language="am-ET">
        ይቅርታ፣ አገልግሎቱ ለጊዜው አልተገኘም።
      </Say>
    </Response>
  `);
}
