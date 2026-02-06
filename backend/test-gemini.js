require("dotenv").config();
const { generateContent } = require("./src/config/gemini");

async function test() {
    try {
        console.log("Testing Gemini 2.5...");
        const text = await generateContent("Hello, are you there?");
        console.log("Response:", text);
    } catch (e) {
        console.error("Gemini Error:", e);
    }
}

test();
