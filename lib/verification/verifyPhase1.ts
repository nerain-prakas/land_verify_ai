import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)?.trim();
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use the specific Hackathon Model with v1beta API
const model = genAI.getGenerativeModel(
  { model: "gemini-3-flash-preview" },
  { apiVersion: "v1beta" }
);
console.log(`✅ Initialized Gemini Model: gemini-3-flash-preview (Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)})`);

interface VerificationResult {
  identity_verification: {
    pan_name: string;
    pan_father_name: string;
    deed_buyer_name: string;
    match_status: "MATCHED" | "MISMATCH" | "PARTIAL";
    fuzzy_match_explanation: string;
    confidence_score: number;
  };
  legal_validity: {
    sub_registrar_seal_found: boolean;
    seal_description: string;
    stamp_paper_detected: boolean;
  };
  data_extraction: {
    survey_number: string;
    district: string;
    seller_name: string;
    land_status: string;
    total_area: string;
  };
  overall_verdict: "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
}

export async function verifyIdentityAndDeed(
  panBuffer: Buffer,
  deedBuffer: Buffer
): Promise<VerificationResult | { error: string; details: string }> {

  // 1. Convert Buffers to Gemini "Inline Parts"
  const panPart = {
    inlineData: {
      data: panBuffer.toString("base64"),
      mimeType: "image/jpeg"
    }
  };

  // 2. Identify if Deed is PDF or Image
  // Simple check for PDF header: %PDF
  const isPdf = deedBuffer.slice(0, 4).toString() === "%PDF";
  const deedMimeType = isPdf ? "application/pdf" : "image/jpeg";

  const deedPart = {
    inlineData: {
      data: deedBuffer.toString("base64"),
      mimeType: deedMimeType
    }
  };

  // 3. The "Smart" Prompt following the Phase 1 Architecture
  const prompt = `
    You are an Expert Legal Verification AI for Indian Land Records.
    
    ### CONTEXT
    I have provided two documents:
    1. **Identity Proof**: PAN Card (Image).
    2. **Sale Deed**: Property Ownership Document (PDF or Image).

    ### YOUR TASKS (Phase 1 Architecture):

    1. **EXTRACT FROM PAN CARD:**
       - Full Name of the cardholder.
       - Father's Name of the cardholder.

    2. **EXTRACT FROM SALE DEED:**
       - The name of the **Buyer/Purchaser** (Look for sections like 'Purchaser', 'Vendee', or 'Buyer').
       - The name of the **Seller/Vendor** (Look for sections like 'Seller', 'Vendor', or 'Transferor').
       - The **Survey Number** (Critical: Look for R.S. No, T.S. No, or "Survey No" in the Schedule of Property section).
       - The **Land Status** (Look for "Freehold", "Private Land", "Ancestral", etc.).
       - The **Total Area / Extent** (Look for the property area, e.g., "2400 Sq. Ft", "5 Cents", etc. in the Schedule section).

    3. **IDENTITY FUZZY MATCHING:**
       - Compare the **PAN Name** with the **Deed Buyer Name**.
       - Perform a FUZZY match (e.g., "S. Kumar" matches "Suresh Kumar", "Abhishek R" matches "Abhishek Rao").
       - Ignore minor spelling differences or initials if the primary names align.
       - Provide a brief explanation of the matching logic.
       - Status: "MATCHED", "MISMATCH", or "PARTIAL".

    4. **VISUAL SEAL CHECK:**
       - Specifically look for the **Official Sub-Registrar Round Seal (Stamp)**.
       - Describe the seal if found (location, text, ink color, shape).
       - Status: true/false.

    ### OUTPUT FORMAT (Strict JSON):
    {
      "identity_verification": {
        "pan_name": "Full Name from PAN",
        "pan_father_name": "Father's Name from PAN",
        "deed_buyer_name": "Buyer Name from Deed",
        "match_status": "MATCHED",
        "fuzzy_match_explanation": "e.g. Names match exactly including middle initial.",
        "confidence_score": 95
      },
      "legal_validity": {
        "sub_registrar_seal_found": true,
        "seal_description": "Found a purple round seal in the bottom right corner with 'SRO' visible.",
        "stamp_paper_detected": true
      },
      "data_extraction": {
        "survey_number": "123/4B",
        "district": "extracted_district_name",
        "seller_name": "Full Name of the Seller",
        "land_status": "Freehold / Private Land",
        "total_area": "Extent: 2400 Sq. Ft"
      },
      "overall_verdict": "APPROVED"
    }
  `;

  try {
    console.log("🚀 Starting Gemini 3 Flash verification (Phase 1 Architecture)...");
    console.log(`📄 PAN size: ${panBuffer.length} bytes`);
    console.log(`📄 Deed size: ${deedBuffer.length} bytes (Detected Mime: ${deedMimeType})`);

    const result = await model.generateContent([
      prompt,
      panPart,
      deedPart
    ]);

    const text = result.response.text();
    console.log("✅ Received response from Gemini 3");

    // Extract JSON block if present to avoid any conversational text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;

    const parsedResult = JSON.parse(cleanedJson) as VerificationResult;
    console.log("📊 Parsed verification result:", parsedResult);

    return parsedResult;
  } catch (error) {
    console.error("Gemini 3 Error:", error);
    return {
      error: "Verification Failed",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
