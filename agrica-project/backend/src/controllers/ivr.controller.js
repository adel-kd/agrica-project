/**
 * IVR Controller
 * Handles Africa’s Talking IVR entry + recording callbacks
 */

const { getOrCreateSession } = require("../services/ivrSession.service");
const { handleRecordingFlow, getPromptForState } = require("../services/ivrFlow.service");
const { logInfo, logError } = require("../utilis/logger");

const normalizeCallerNumber = (value) => {
  if (!value || typeof value !== "string") return "unknown";

  const trimmed = value.trim();
  if (!trimmed) return "unknown";

  // In application/x-www-form-urlencoded payloads, a leading "+" can be parsed as whitespace.
  if (trimmed[0] === "0" || trimmed.startsWith("251")) {
    return `+${trimmed.replace(/^\+/, "")}`;
  }

  return trimmed;
};



/**
 * STEP 1: IVR ENTRY POINT
 * - Triggered when call starts
 * - Plays welcome prompt
 * - Records farmer voice
 */
exports.ivrEntry = async (req, res) => {
  try {
    res.set("Content-Type", "text/xml");

  const sessionId = req.body.sessionId || req.body.sessionID || "unknown";
  const callerNumber = normalizeCallerNumber(req.body.callerNumber || req.body.phoneNumber || "unknown");

    await getOrCreateSession({ sessionId, callerNumber });

    logInfo("📞 IVR ENTRY", {
      sessionId,
      callerNumber,
      body: req.body,
    });

    const prompt = getPromptForState("awaiting_intent");

    const xmlResponse = `
<Response>
  <Say language="am-ET">${prompt}</Say>

  <Record
    maxLength="20"
    finishOnKey="#"
    callbackUrl="/api/ivr/recording"
  />
</Response>
`;

    logInfo("📤 IVR XML (entry)", { sessionId, xml: xmlResponse });

    res.send(xmlResponse);
  } catch (err) {
    logError("IVR entry failed", err);
    fallback(res);
  }
};

/**
 * STEP 2: RECORDING CALLBACK
 * - Receives recording URL
 * - STT (Hasab)
 * - Intent + reasoning (Gemini)
 * - TTS (Hasab)
 * - Responds with <Play> or <Say + Record>
 */
exports.ivrRecording = async (req, res) => {
  try {
    const recordingUrl =
      req.body.recordingUrl ||
      req.body.RecordingUrl ||
      req.body.recordingURL ||
      req.body.recording_url;
    const sessionId = req.body.sessionId || req.body.sessionID || req.body.session_id || "unknown";
    const callerNumber = normalizeCallerNumber(
      req.body.callerNumber || req.body.phoneNumber || req.body.caller || req.body.caller_number || "unknown"
    );

    if (!recordingUrl) {
      const xmlResponse = `
        <Response>
          <Say language="am-ET">እባክዎ ድምፅዎን እንደገና ይቅዱ።</Say>
          <Record
            maxLength="20"
            finishOnKey="#"
            callbackUrl="/api/ivr/recording"
          />
        </Response>
      `;
      logInfo("IVR recording callback missing recordingUrl", {
        sessionId,
        callerNumber,
        bodyKeys: Object.keys(req.body || {})
      });
      res.send(xmlResponse);
      return;
    }

    const result = await handleRecordingFlow({ sessionId, callerNumber, recordingUrl });

    res.set("Content-Type", "text/xml");
    if (result.type === "play") {
      const xmlResponse = `
<Response>
  <Play>${result.audioUrl}</Play>
</Response>
`;

      logInfo("📤 IVR XML (play)", { sessionId, xml: xmlResponse });
      res.send(xmlResponse);
      return;
    }

    /**
     * CASE 2: Say text + continue recording
     */
    const xmlResponse = `
<Response>
  <Say language="am-ET">${result.message}</Say>

  <Record
    maxLength="20"
    finishOnKey="#"
    callbackUrl="/api/ivr/recording"
  />
</Response>
`;

    logInfo("📤 IVR XML (continue)", { sessionId, xml: xmlResponse });
    res.send(xmlResponse);
  } catch (err) {
    logError("IVR recording failed", err);
    fallback(res);
  }
};

/**
 * FALLBACK RESPONSE
 * - Used when anything crashes
 * - Must ALWAYS return valid XML
 */
function fallback(res) {
  res.set("Content-Type", "text/xml");

  const xmlResponse = `
<Response>
  <Say language="am-ET">
    ይቅርታ፣ አገልግሎቱ ለጊዜው አልተገኘም።
  </Say>
</Response>
`;

  res.send(xmlResponse);
}
