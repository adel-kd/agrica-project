const axios = require("axios");
const fs = require("fs");
const path = require("path");

const Farmer = require("../models/Farmer");
const CropListing = require("../models/CropListing");
const { askGemini } = require("./gemini.service");
const { transcribeAudio, textToSpeech } = require("./hasab.service");
const { detectFarmerIntent } = require("./intent.service");
const { getOrCreateSession, updateSession, resetSession } = require("./ivrSession.service");
const { logInfo, logError } = require("../utilis/logger");

const uploadsDir = path.join(__dirname, "../../uploads");

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

const extractNumber = (text) => {
  if (!text) return null;
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  return Number(match[1]);
};

const detectUnit = (text) => {
  if (!text) return null;
  const normalized = text.toLowerCase();
  if (normalized.includes("kg") || normalized.includes("kilo") || normalized.includes("ኪሎ")) {
    return "kg";
  }
  if (normalized.includes("quintal") || normalized.includes("ቂንጣር")) {
    return "quintal";
  }
  return null;
};

const getPromptForState = (state) => {
  const prompts = {
    awaiting_intent: "እባክዎ የፈለጉትን ነገር ይናገሩ። ምክር ለመጠየቅ፣ ምርት ለመሸጥ ወይም ለመመዝገብ ትክክለኛውን ቃል ይናገሩ።",
    register_full_name: "እባክዎ ሙሉ ስምዎን ይናገሩ።",
    register_region: "እባክዎ የሚኖሩበትን ክልል ይናገሩ።",
    register_woreda: "እባክዎ ወረዳዎን ይናገሩ።",
    register_language: "የመመርጠውን ቋንቋ ይናገሩ። ለምሳሌ አማርኛ።",
    sell_crop_type: "ምን ዓይነት ሰብል ለመሸጥ ትፈልጋላችሁ? ለምሳሌ ጤፍ ወይም ስንዴ።",
    sell_quantity: "መጠኑ ስንት ነው? ቁጥር ብቻ ይናገሩ።",
    sell_unit: "የመጠኑ መለኪያ ምንድነው? ኪሎ ወይም ቂንጣር ይናገሩ።",
    sell_price: "ተፈላጊ ዋጋ ስንት ነው? ቁጥር ብቻ ይናገሩ።",
    sell_location: "ምርቱ የሚገኝበት ቦታ ይናገሩ።",
    sell_harvest_date: "የመከር ቀን መቼ ነው? ቀን ወይም ወር በቃል ይናገሩ።",
    price_crop_type: "ዋጋ ለመፈለግ የሚፈልጉትን ሰብል ይናገሩ።"
  };

  return prompts[state] || prompts.awaiting_intent;
};

const downloadRecording = async (recordingUrl, sessionId) => {
  ensureUploadsDir();
  const audioPath = path.join(uploadsDir, `${sessionId}-${Date.now()}.wav`);
  const audioResponse = await axios({
    url: recordingUrl,
    method: "GET",
    responseType: "stream"
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(audioPath);
    audioResponse.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return audioPath;
};

const handleAdvice = async (text, sessionId) => {
  const ai = await askGemini(text);
  logInfo("AI response", { sessionId, ai });
  const responseText = ai.response_for_farmer || (typeof ai === "string" ? ai : JSON.stringify(ai));
  const audioUrl = await textToSpeech(responseText, {
    language: "amh",
    speaker: "selam"
  });
  await resetSession(sessionId);
  return { type: "play", audioUrl };
};

const handlePriceQuery = async (cropType, sessionId) => {
  const ai = await askGemini(`Provide current market guidance for ${cropType} crops in Ethiopia.`);
  logInfo("AI price response", { sessionId, ai });
  const responseText = ai.response_for_farmer || (typeof ai === "string" ? ai : JSON.stringify(ai));
  const audioUrl = await textToSpeech(responseText, {
    language: "amh",
    speaker: "selam"
  });
  await resetSession(sessionId);
  return { type: "play", audioUrl };
};

const handleRegistrationFlow = async (session, text) => {
  const { state, data, callerNumber } = session;

  if (state === "register_full_name") {
    if (!text || text.length < 2) {
      return { type: "say", message: "ስም አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "register_region",
      data: { ...data, fullName: text }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "register_region") {
    if (!text || text.length < 2) {
      return { type: "say", message: "ክልሉ አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "register_woreda",
      data: { ...data, region: text }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "register_woreda") {
    if (!text || text.length < 2) {
      return { type: "say", message: "ወረዳ አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "register_language",
      data: { ...data, woreda: text }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "register_language") {
    if (!text || text.length < 2) {
      return { type: "say", message: "ቋንቋ አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const preferredLanguage = text;

    await Farmer.findOneAndUpdate(
      { phoneNumber: callerNumber },
      {
        fullName: data.fullName,
        phoneNumber: callerNumber,
        region: data.region,
        woreda: data.woreda,
        preferredLanguage
      },
      { upsert: true, new: true }
    );

    await resetSession(session.sessionId);
    return { type: "say", message: "ምዝገባዎ ተጠናቀቀ። እናመሰግናለን።" };
  }

  return { type: "say", message: getPromptForState("awaiting_intent") };
};

const handleSellFlow = async (session, text) => {
  const { state, data, callerNumber } = session;

  if (state === "sell_crop_type") {
    if (!text || text.length < 2) {
      return { type: "say", message: "የሰብል አይነት አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "sell_quantity",
      data: { ...data, cropType: text }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "sell_quantity") {
    const quantity = extractNumber(text);
    if (!quantity) {
      return { type: "say", message: "መጠኑ አልተሰማም። ቁጥር ብቻ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "sell_unit",
      data: { ...data, quantity }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "sell_unit") {
    const unit = detectUnit(text);
    if (!unit) {
      return { type: "say", message: "መለኪያ አልተረዳም። ኪሎ ወይም ቂንጣር ብለው ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "sell_price",
      data: { ...data, unit }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "sell_price") {
    const expectedPrice = extractNumber(text);
    if (!expectedPrice) {
      return { type: "say", message: "ዋጋ አልተሰማም። ቁጥር ብቻ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "sell_location",
      data: { ...data, expectedPrice }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "sell_location") {
    if (!text || text.length < 2) {
      return { type: "say", message: "ቦታ አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }
    const updated = await updateSession(session.sessionId, {
      state: "sell_harvest_date",
      data: { ...data, location: text }
    });
    return { type: "say", message: getPromptForState(updated.state) };
  }

  if (state === "sell_harvest_date") {
    if (!text || text.length < 2) {
      return { type: "say", message: "የመከር ቀን አልተሰማም። እባክዎ ደግሞ ይናገሩ።" };
    }

    const listing = await CropListing.create({
      farmer: data.farmerId,
      phoneNumber: callerNumber,
      cropType: data.cropType,
      quantity: data.quantity,
      unit: data.unit,
      expectedPrice: data.expectedPrice,
      location: data.location,
      harvestDate: text,
      source: "ivr"
    });

    logInfo("Crop listing created", { listingId: listing._id, callerNumber });
    await resetSession(session.sessionId);
    return { type: "say", message: "ምርትዎ ተመዝግቧል። እናመሰግናለን።" };
  }

  return { type: "say", message: getPromptForState("awaiting_intent") };
};

const handleRecordingFlow = async ({ sessionId, callerNumber, recordingUrl }) => {
  try {
    const session = await getOrCreateSession({ sessionId, callerNumber });
    logInfo("IVR recording received", { sessionId, callerNumber });

    const audioPath = await downloadRecording(recordingUrl, sessionId);
    const transcript = await transcribeAudio(audioPath, "amh");
    // Best-effort cleanup of temporary audio file
    try {
      fs.unlink(audioPath, () => {});
    } catch (cleanupErr) {
      logError("Failed to cleanup IVR audio file", { error: cleanupErr.message, sessionId, audioPath });
    }
    logInfo("STT transcript", { sessionId, transcript });

    if (session.state === "awaiting_intent") {
      const { intent } = await detectFarmerIntent(transcript);
      logInfo("Intent detected", { sessionId, intent });
      if (intent === "farming_advice") {
        await updateSession(sessionId, { intent, state: "advice" });
        return await handleAdvice(transcript, sessionId);
      }

      if (intent === "register_farmer") {
        const updated = await updateSession(sessionId, { intent, state: "register_full_name" });
        return { type: "say", message: getPromptForState(updated.state) };
      }

      if (intent === "sell_crops") {
        const farmer = await Farmer.findOne({ phoneNumber: callerNumber });
        const updated = await updateSession(sessionId, {
          intent,
          state: "sell_crop_type",
          data: { farmerId: farmer?._id }
        });
        return { type: "say", message: getPromptForState(updated.state) };
      }

      if (intent === "check_prices") {
        const updated = await updateSession(sessionId, { intent, state: "price_crop_type" });
        return { type: "say", message: getPromptForState(updated.state) };
      }

      return { type: "say", message: getPromptForState("awaiting_intent") };
    }

    if (session.state.startsWith("register_")) {
      return await handleRegistrationFlow(session, transcript);
    }

    if (session.state.startsWith("sell_")) {
      return await handleSellFlow(session, transcript);
    }

    if (session.state === "price_crop_type") {
      return await handlePriceQuery(transcript, sessionId);
    }

    return { type: "say", message: getPromptForState("awaiting_intent") };
  } catch (error) {
    logError("IVR flow error", { error: error.message });
    return { type: "say", message: "ይቅርታ፣ አገልግሎቱ ለጊዜው አልተገኘም።" };
  }
};

module.exports = { handleRecordingFlow, getPromptForState };
