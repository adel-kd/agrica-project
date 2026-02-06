const IVRSession = require("../models/IVRSession");

const getOrCreateSession = async ({ sessionId, callerNumber }) => {
  const existing = await IVRSession.findOne({ sessionId });
  if (existing) {
    return existing;
  }

  return IVRSession.create({
    sessionId,
    callerNumber,
    state: "awaiting_intent",
    intent: "unknown",
    language: "amh",
    data: {}
  });
};

const updateSession = async (sessionId, updates) => {
  return IVRSession.findOneAndUpdate({ sessionId }, updates, { new: true });
};

const resetSession = async (sessionId) => {
  return updateSession(sessionId, {
    state: "awaiting_intent",
    intent: "unknown",
    data: {}
  });
};

module.exports = {
  getOrCreateSession,
  updateSession,
  resetSession
};
