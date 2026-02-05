const { getOrCreateSession } = require("../services/ivrSession.service");
const { handleRecordingFlow, getPromptForState } = require("../services/ivrFlow.service");
const { logInfo } = require("../utilis/logger");

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
 * STEP 1: IVR entry point
 * Plays welcome message and records farmer voice
 */
exports.ivrEntry = async (req, res) => {
  res.set("Content-Type", "text/xml");

  const sessionId = req.body.sessionId || req.body.sessionID || "unknown";
  const callerNumber = normalizeCallerNumber(req.body.callerNumber || req.body.phoneNumber || "unknown");

  await getOrCreateSession({ sessionId, callerNumber });
  logInfo("IVR entry", { sessionId, callerNumber });

  const xmlResponse = `
    <Response>
      <Say language="am-ET">
        ${getPromptForState("awaiting_intent")}
      </Say>

      <Record
        maxLength="20"
        finishOnKey="#"
        callbackUrl="/api/ivr/recording"
      />
    </Response>
  `;

  logInfo("IVR XML response", { sessionId, xml: xmlResponse });
  res.send(xmlResponse);
};

/**
 * STEP 2: Recording callback
 * Receives audio URL → STT → Gemini → TTS → plays answer
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
      logInfo("IVR XML response", { sessionId, xml: xmlResponse });
      res.send(xmlResponse);
      return;
    }

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
    logInfo("IVR XML response", { sessionId, xml: xmlResponse });
    res.send(xmlResponse);
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
