const https = require('https');
require('dotenv').config({ path: '.env.local' });

async function testRawGemini() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    const modelName = "gemini-3-flash-preview";
    console.log(`Testing raw https with key: ${apiKey ? apiKey.substring(0, 5) + "..." : "MISSING"} and model: ${modelName}`);

    if (!apiKey) return;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

    const body = JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    const req = https.request(url, options, (res) => {
        let data = '';
        console.log("Status:", res.statusCode);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log("Response:", data);
            if (res.statusCode === 200) {
                console.log("✅ RAW HTTPS SUCCESS!");
            } else {
                console.log("❌ RAW HTTPS FAILED.");
            }
        });
    });

    req.on('error', (e) => {
        console.error("Https error:", e.message);
    });

    req.write(body);
    req.end();
}

testRawGemini();
