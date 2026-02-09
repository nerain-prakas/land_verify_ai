const fs = require('fs');
const path = require('path');

async function listModels() {
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
            }
        }
    }

    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env.local or process.env");
        return;
    }

    try {
        console.log("Fetching models from v1beta...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models (v1beta):");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found in v1beta or error:", JSON.stringify(data, null, 2));
        }

        console.log("\nFetching models from v1...");
        const responseV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const dataV1 = await responseV1.json();

        if (dataV1.models) {
            console.log("Available Models (v1):");
            dataV1.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found in v1 or error:", JSON.stringify(dataV1, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
