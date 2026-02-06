const { generateContent, generateRawContent } = require("../config/gemini");
const { logInfo, logError } = require("../utilis/logger");
const { transcribeAudio, textToSpeech } = require("../services/hasab.service");
const fs = require("fs");
const path = require("path");

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

    if (!text) {
      logError("AI chat failed: Quota likely exceeded or API error.");
      return res.status(503).json({
        reply: "ሰላም! በአሁኑ ጊዜ የኔ አእምሮ (Gemini AI) በስራ ተወጥሯል። እባክዎን ከጥቂት ደቂቃዎች በኋላ እንደገና ይሞክሩ። ለጊዜው በድምፅ አገልግሎታችን መጠቀም ይችላሉ።"
      });
    }

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
- Estimate overall crop health as a score between 0 and 100 (where 100 is healthy).
- Give clear treatment and prevention advice in simple language.

CRITICAL: Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
{
  "diagnosis": "Short diagnosis summary",
  "health_score": 85,
  "issues": ["List of specific issues found"],
  "treatment": "Step-by-step treatment advice",
  "prevention": "Prevention advice"
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
      // Clean potential markdown code blocks
      const cleanText = text.replace(/```json|```/g, "").trim();
      payload = JSON.parse(cleanText);
    } catch (e) {
      logError("AI image analysis JSON parse failed", { text });
      payload = {
        diagnosis: "Could not analyze image automatically. Please try again.",
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

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * POST /api/ai/voice
 * Voice-to-Voice AI Chat.
 */
exports.handleVoiceChat = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      logError("Voice Chat Error: No file provided");
      return res.status(400).json({ error: "Audio file is required" });
    }

    logInfo(`🎙️ [VoiceChat] Received file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);


    // 1. Process Audio with FFmpeg to ensure it's a valid WAV
    const inputPath = path.join(__dirname, "../../uploads", `input_${Date.now()}_${file.originalname}`);
    const wavPath = path.join(__dirname, "../../uploads", `processed_${Date.now()}.wav`);

    fs.writeFileSync(inputPath, file.buffer);

    logInfo("Converting audio to WAV...", { inputPath, wavPath });

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat("wav")
          .on("error", (err) => {
            logError("FFmpeg Conversion Error:", err.message);
            reject(err);
          })
          .on("end", () => {
            logInfo("FFmpeg Conversion Complete");
            resolve();
          })
          .save(wavPath);
      });
    } catch (ffmpegErr) {
      logError("Critical: FFmpeg conversion failed", ffmpegErr.message);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(500).json({ error: "Audio processing failed. FFmpeg conversion error." });
    }

    // 2. Transcribe (MOCKED AS REQUESTED)
    logInfo("🎙️ [MockSTT] Using user-provided mock text.");
    const transcription = "ሰላም አድል እባላለሁ ገበሬ ነኝ እርዳኝ";

    // Clean up temp files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    logInfo("User said (mock):", { transcription });




    // 2. Ask Gemini (MOCKED FOR STABILITY)
    logInfo("🤖 [VoiceChat] Using mocked Gemini response for stability.");
    const geminiResponse = "ሰላም አድል! እንኳን ደህና መጡ። እኔ አግሪካ አይ ነኝ፣ በግብርና ስራዎ እንዴት ልረዳዎት እችላለሁ?";


    // 3. TTS
    logInfo("🎙️ [VoiceChat] Starting TTS...");
    const outputFilename = `tts_${Date.now()}.wav`;
    const outputDir = path.join(__dirname, "../../uploads");
    const ttsPath = path.join(outputDir, outputFilename);

    let audioUrl;
    try {
      await textToSpeech(geminiResponse, {
        speaker: "selam",
        savePath: ttsPath
      });
      logInfo("🎙️ [VoiceChat] TTS Complete.");
      audioUrl = `/uploads/${outputFilename}`;
    } catch (e) {
      logError("TTS Failed", e.message);
      audioUrl = null;
    }

    logInfo("Voice Chat Processing Complete:", { transcription, geminiResponse, audioUrl });

    res.json({
      user_text: transcription,
      reply_text: geminiResponse,
      audio_url: audioUrl
    });

  } catch (error) {
    logError("CRITICAL: Voice chat overall failure", { error: error.message, stack: error.stack });
    res.status(500).json({ error: `Voice processing failed: ${error.message}` });
  }
};

