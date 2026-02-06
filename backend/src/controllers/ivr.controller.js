/**
 * IVR Controller (Infobip Version)
 * Handles sending voice messages via Infobip and processing Webhook callbacks
 */

const { sendVoiceMessage } = require("../services/infobip.service");
const { getOrCreateSession } = require("../services/ivrSession.service");
// const { handleRecordingFlow } = require("../services/ivrFlow.service"); // Recording flow might need adaptation for Infobip if using simple TTS
const { logInfo, logError } = require("../utilis/logger");

const normalizeCallerNumber = (value) => {
  if (!value || typeof value !== "string") return "unknown";
  const trimmed = value.trim();
  if (!trimmed) return "unknown";
  if (trimmed[0] === "0" || trimmed.startsWith("251")) {
    return `+${trimmed.replace(/^\+/, "")}`;
  }
  return trimmed;
};

/**
 * TRIGGER OUTBOUND CALL (Simulates IVR Entry)
 * This could be called by a cron job or an admin API to contact a farmer.
 * For now, we'll expose it as an endpoint to test the flow: POST /api/ivr/call
 */
exports.initiateCall = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const textToSay = message || "Welcome to Agrica. We are verifying your crop details."; // Default prompt

    // In a real IVR, we might create a session here
    await getOrCreateSession({ sessionId: `outbound-${Date.now()}`, callerNumber: normalizeCallerNumber(phoneNumber) });

    const result = await sendVoiceMessage(phoneNumber, textToSay);

    res.json({ success: true, data: result });
  } catch (err) {
    logError("Failed to initiate Infobip call", err);
    res.status(500).json({ error: "Failed to initiate call" });
  }
};

/**
 * WEBHOOK HANDLER
 * Infobip sends delivery reports or DTMF logs here if configured.
 */
/**
 * WEBHOOK HANDLER
 * Handles inbound calls and interactive events from Infobip.
 * Flow:
 * 1. inbound_call -> play greeting -> record
 * 2. recording_finished -> STT -> AI -> TTS -> play response -> record
 */
const fs = require("fs");
const path = require("path");
const { transcribeAudio, textToSpeech } = require("../services/hasab.service");
const { generateContent } = require("../config/gemini");
const axios = require("axios");

exports.ivrWebhook = async (req, res) => {
  try {
    const event = req.body;
    logInfo("📞 Infobip Webhook Received", event);

    // 1. Identify Event Type
    // Note: This matches a generic Infobip interaction structure. 
    // Adjust specific property names based on actual Infobip Voice API payload.
    // Assuming 'results' array contains recording or dtmf.

    // CASE A: Processing a Recording (User spoke)
    if (event.results && event.results.length > 0) {
      const result = event.results[0];

      if (result.recordedUrl) {
        logInfo("🎙️ Processing Recording...", { url: result.recordedUrl });

        // A. Download Audio
        const tempFile = path.join(__dirname, "../../uploads", `inbound_${Date.now()}.wav`);
        const writer = fs.createWriteStream(tempFile);

        const audioResponse = await axios({
          url: result.recordedUrl,
          method: 'GET',
          responseType: 'stream'
        });

        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // B. STT (Hasab)
        let userText = "";
        try {
          userText = await transcribeAudio(tempFile, "am"); // Defaulting to Amharic
        } catch (sttErr) {
          logError("STT Error", sttErr.message);
          userText = "error";
        }

        // Cleanup temp input
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        logInfo("🗣️ User Said:", userText);

        // C. AI Intelligence (Gemini)
        let aiReply = "ይቅርታ፣ በደንብ አልሰማሁዎትም። እባክዎን እንደገና ይናገሩ።"; // Amharic fallback
        if (userText && userText !== "error") {
          console.log("🧠 Sending to AI for response generation...");
          const prompt = `You are a helpful agricultural expert. You MUST answer strictly in Amharic script. Keep it very short (max 2 sentences). User said: "${userText}"`;
          aiReply = await generateContent(prompt);
          console.log("✅ AI Reply:", aiReply);
        }

        // D. TTS (Hasab) -> Get Audio URL
        // Note: Infobip needs a public URL to play. 
        // Since we are localhost/internal, we might return text for Infobip to speak (Standard TTS) 
        // OR we use Hasab TTS and serve the file via our public /uploads endpoint.
        // Let's try Hasab TTS and serve it.

        const ttsFilename = `reply_${Date.now()}.wav`;
        const ttsPath = path.join(__dirname, "../../uploads", ttsFilename);

        console.log("🎙️ Requesting TTS for AI Reply:", aiReply);
        const generatedUrl = await textToSpeech(aiReply, { savePath: ttsPath, speaker: "selam" });
        console.log("✅ Generated TTS URL:", generatedUrl);

        // We need our server's public base URL. Assuming typical setup or ngrok.
        // If generic localhost, Infobip can't reach it. 
        // FALLBACK: Use Infobip's text-to-speech if Hasab needs local storage.
        // But user requested "Hasab".
        // We will save it and construct a URL assuming the server is reachable.

        // If textToSpeech returns a public URL (e.g. Google TTS), use it directly.
        // Otherwise, use our local file URL.
        const host = req.get('host');
        const protocol = req.protocol;
        const audioUrl = generatedUrl.startsWith('http') && !generatedUrl.includes(host)
          ? generatedUrl
          : `${protocol}://${host}/uploads/${ttsFilename}`;
        console.log("🔗 Final Audio URL for Infobip:", audioUrl);

        // Response to Infobip: Play this audio, then Record again
        console.log("➡️ Responding to Infobip with play and record commands.");
        return res.json({
          commands: [
            {
              play: {
                url: audioUrl
              }
            },
            {
              record: {
                maxDuration: 10,
                silenceTimeout: 2
              }
            }
          ]
        });
      }
    }

    // CASE B: Initial Call (or Fallback)
    // If no recording, assume it's a new call or just entered via webhook
    // Play greeting and Record
    const greeting = "Welcome to Agrica. How can I help you today?";
    // For speed, we can specificy text directly if Infobip supports 'say' command in response
    // Or generated TTS.

    return res.json({
      commands: [
        {
          say: greeting
        },
        {
          record: {
            maxDuration: 10,
            silenceTimeout: 2
          }
        }
      ]
    });

  } catch (err) {
    logError("Webhook processing failed", err);
    res.status(500).json({ error: "IVR Error" });
  }
};

// Deprecated Entry Point (Africa's Talking specific) kept as stub or removed
exports.ivrEntry = async (req, res) => {
  res.status(404).send("Endpoint deprecated. Use /api/ivr/call for outbound.");
};

exports.ivrRecording = async (req, res) => {
  res.status(404).send("Endpoint deprecated.");
};
