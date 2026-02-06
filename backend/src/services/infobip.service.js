const axios = require("axios");
const { logInfo, logError } = require("../utilis/logger");

const getInfobipConfig = () => {
    const apiKey = process.env.INFOBIP_API_KEY;
    let baseUrl = process.env.INFOBIP_BASE_URL;

    if (!apiKey || !baseUrl) {
        throw new Error("INFOBIP_API_KEY or INFOBIP_BASE_URL not configured");
    }

    if (!baseUrl.startsWith("http")) {
        baseUrl = `https://${baseUrl}`;
    }

    return {
        baseUrl,
        headers: {
            Authorization: `App ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    };
};

/**
 * Send an Advanced Voice Message (TTS)
 * @param {string} to - Destination phone number (e.g., "251...")
 * @param {string} text - Message text to speak
 * @param {string} language - Language code (e.g., "en", "am" if supported, default "en")
 * @param {boolean} captureInput - Whether to capture user input (DTMF) - Not fully supported in basic TTS API without Scenario, but included for extensibility if using IVR scenarios
 */
const sendVoiceMessage = async (to, text, language = "en") => {
    try {
        const { baseUrl, headers } = getInfobipConfig();
        const cleanNumber = to.replace(/^\+/, ""); // Infobip usually expects no plus or proper format

        const payload = {
            messages: [
                {
                    destinations: [{ to: cleanNumber }],
                    from: "38515507799", // Default sender from user snippet
                    language: language,
                    text: text,
                    voice: {
                        name: "Joanna", // Default from user snippet, change as needed
                        gender: "female",
                    },
                },
            ],
        };

        logInfo("🚀 Sending Infobip Voice Message", { to: cleanNumber, text });

        const response = await axios.post(`${baseUrl}/tts/3/advanced`, payload, {
            headers,
        });

        logInfo("✅ Infobip Response", response.data);
        return response.data;
    } catch (error) {
        logError("❌ Infobip Send Error", error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendVoiceMessage,
};
