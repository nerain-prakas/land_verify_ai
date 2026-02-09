import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)?.trim();
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel(
    { model: "gemini-3-flash-preview" },
    { apiVersion: "v1beta" }
);
console.log(`✅ Initialized Gemini Model (Phase 2): gemini-3-flash-preview (Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)})`);

interface Phase2Inputs {
    deedName: string;
    deedSurveyNo: string;
    deedLandStatus?: string;
    deedTotalArea?: string;
}

interface Phase2Result {
    status: "APPROVED" | "REJECTED" | "WARNING";
    matches: {
        name_match: boolean;
        survey_match: boolean;
    };
    land_facts: {
        classification: "Wetland" | "Dryland" | "Housing" | "Unknown";
        is_government_land: boolean;
        official_area_text: string;
    };
    geo_target: {
        district_name: string;
        taluk_name: string;
        revenue_village_name: string;
    };
    rejection_reason?: string;
}

export async function verifyDeedAgainstPatta(
    pattaBuffer: Buffer,
    inputs: Phase2Inputs
): Promise<Phase2Result | { error: string; details: string }> {

    const pattaPart = {
        inlineData: {
            data: pattaBuffer.toString("base64"),
            mimeType: "image/jpeg" // Assuming Patta is usually an image/scan
        }
    };

    const prompt = `
    You are a Government Land Record Auditor.
    I am providing a "Patta Chitta" document (likely in Tamil/English).
    
    ### 🎯 GOAL
    Verify if this official government record MATCHES the CURRENT OWNER (Purchaser from the Sale Deed).

    ### ⚠️ CRITICAL INSTRUCTION
    The "Claimed Purchaser" below is the NEW OWNER (the person WHO BOUGHT the land).
    The Patta Chitta should show THIS person's name as the current registered owner.
    DO NOT compare against the Vendor/Seller (the old owner who SOLD the land).

    ### 1️⃣ INPUT DATA (FROM DEED & PAN VERIFICATION)
    - Claimed Purchaser (New Owner): "${inputs.deedName}"
    - Claimed Survey No: "${inputs.deedSurveyNo}"
    ${inputs.deedLandStatus ? `- Claimed Land Status: "${inputs.deedLandStatus}"` : ""}
    ${inputs.deedTotalArea ? `- Claimed Total Area: "${inputs.deedTotalArea}"` : ""}

    ### 2️⃣ EXTRACT & VERIFY FROM PATTA IMAGE
    Analyze the image and return a JSON object with these checks:

    1. **Name Match:** Does the CURRENT OWNER name in the Patta match "${inputs.deedName}"? 
       - (Allow for phonetic differences like 'Ravi' vs 'Ravee', or middle name variations).
    
    2. **Survey Number Match:** Does the Patta contain Survey No "${inputs.deedSurveyNo}"?
    
    3. **Land Classification (The Critical Check):**
       - Look for keywords: "Nanjai" (Wet), "Punjai" (Dry), "Manaivari" (House), "Natham".
       - Translate from Tamil if needed.
    
    4. **Risk Scan (Safety):**
       - DOES it say "Sarkar" or "Poramboke" or "Government" or "Waqf"? (True/False).
    
    5. **Official Area:** - Extract the area shown (e.g., "0.40.50" Hectares).

    6. **Geographical Location (The Geofencing Target):**
       - Extract the following for dynamic geofencing:
       - **District Name** (Search for "District", "மாவட்டம்" / "Mavattam").
       - **Taluk Name** (Search for "Taluk", "வட்டம்" / "Vattam").
       - **Revenue Village Name** (Search for "Village", "கிராமம்" / "Kiramam").
       - FALLBACK: If "Village" is not found, use the "Taluk" name as the village center.

    ### 📤 OUTPUT JSON (Strict JSON)
    {
      "status": "APPROVED" | "REJECTED" | "WARNING",
      "matches": {
        "name_match": boolean,
        "survey_match": boolean
      },
      "land_facts": {
        "classification": "Wetland" | "Dryland" | "Housing",
        "is_government_land": boolean,
        "official_area_text": "String"
      },
      "geo_target": {
        "district_name": "String",
        "taluk_name": "String",
        "revenue_village_name": "String"
      },
      "rejection_reason": "String (if any)"
    }
  `;

    try {
        console.log("🚀 Starting Phase 2 Patta Verification...");

        const result = await model.generateContent([
            prompt,
            pattaPart
        ]);

        const text = result.response.text();
        console.log("✅ Received response from Gemini 3 (Phase 2)");

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanedJson = jsonMatch ? jsonMatch[0] : text;

        const parsedResult = JSON.parse(cleanedJson) as Phase2Result;
        console.log("📊 Phase 2 Verification Result:", parsedResult);

        return parsedResult;
    } catch (error) {
        console.error("Phase 2 Error:", error);
        return {
            error: "Phase 2 Verification Failed",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}
