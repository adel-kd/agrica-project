const { getOrCreateSession } = require("../services/ivrSession.service");
const { handleRecordingFlow, getPromptForState } = require("../services/ivrFlow.service");
const { logInfo } = require("../utilis/logger");

/**
 * STEP 1: IVR entry point
 * Plays welcome message and records farmer voice
 */
exports.ivrEntry = async (req, res) => {
  res.set("Content-Type", "text/xml");

  const sessionId = req.body.sessionId || req.body.sessionID || "unknown";
  const callerNumber = req.body.callerNumber || req.body.phoneNumber || "unknown";

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
    const recordingUrl = req.body.recordingUrl;
    const sessionId = req.body.sessionId || req.body.sessionID || "unknown";
    const callerNumber = req.body.callerNumber || req.body.phoneNumber || "unknown";

    if (!recordingUrl) {
      throw new Error("No recording URL from Africa’s Talking");
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
