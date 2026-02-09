const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    const gApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("--- Diagnostics ---");
    console.log("GOOGLE_GEMINI_API_KEY set:", !!gApiKey);
    if (gApiKey) {
        console.log("Length:", gApiKey.length);
        console.log("Starts with:", gApiKey.substring(0, 7));
        console.log("Ends with:", gApiKey.substring(gApiKey.length - 3));
        console.log("Raw (check for spaces):", `'${gApiKey}'`);
    }

    console.log("\nGEMINI_API_KEY set:", !!apiKey);
    if (apiKey) {
        console.log("Length:", apiKey.length);
        console.log("Raw:", `'${apiKey}'`);
    }

    const finalKey = apiKey || gApiKey;
    if (!finalKey) {
        console.error("No API key found!");
        return;
    }

    const genAI = new GoogleGenerativeAI(finalKey.trim());

    try {
        console.log("\nTesting gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log("Success! Response length:", result.response.text().length);
        console.log("✅ API Key is VALID.");
    } catch (error) {
        console.error("❌ gemini-1.5-flash failed:", error.message);
        if (error.message.includes("400") || error.message.includes("API_KEY_INVALID")) {
            console.log("Suggestion: The API key appears invalid or restricted.");
        }
    }
}

testGemini();
