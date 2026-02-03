const { generateContent } = require("../config/gemini");

exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

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
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
};
