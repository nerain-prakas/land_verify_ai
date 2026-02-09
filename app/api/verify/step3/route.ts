import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)?.trim();
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// MANDATORY: Use gemini-3-flash-preview model
const model = genAI.getGenerativeModel(
    { model: "gemini-3-flash-preview" },
    { apiVersion: "v1beta" }
);
console.log(`✅ Initialized Gemini Model (Step 3): gemini-3-flash-preview (Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)})`);

interface VideoAnalysisResult {
    land_quality: {
        topography: string;
        soil_type: string;
        vegetation: string;
        nearby_infrastructure: string[];
        water_presence: string;
        boundary_clarity: string;
    };
    audio_analysis: {
        detected_sounds: string[];
        traffic_density: string; // "High", "Moderate", "Low", "Nature", "Industrial"
        noise_pollution_score: number; // 1-10
        environment_summary: string;
    };
    overall_verdict: string;
    suitability_score: number;
    recommendations: string;
    detailed_report: string;
}

export async function POST(req: Request) {
    let tempFilePath: string | null = null;

    try {
        const formData = await req.formData();
        const videoFile = formData.get("video") as File | null;

        // Get context from previous steps
        const surveyNo = formData.get("survey_no") as string | null;
        const verifiedName = formData.get("verified_name") as string | null;
        const landStatus = formData.get("land_status") as string | null;
        const totalArea = formData.get("total_area") as string | null;

        // Validation
        if (!videoFile) {
            return NextResponse.json(
                { error: "Video file is required" },
                { status: 400 }
            );
        }

        // File size validation (100MB = 100 * 1024 * 1024 bytes)
        const MAX_SIZE = 100 * 1024 * 1024;
        if (videoFile.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Video file size must be under 100MB" },
                { status: 400 }
            );
        }

        // File type validation
        const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
        if (!allowedTypes.includes(videoFile.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload .mp4, .mov, or .avi file" },
                { status: 400 }
            );
        }

        console.log("🚀 Starting Video Analysis (Step 3)...");
        console.log(`📹 Video: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);
        console.log(`📊 Context: Survey No: ${surveyNo}, Owner: ${verifiedName}`);

        // Convert File to Buffer and write to temp file
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create temp file path
        tempFilePath = join(tmpdir(), `land-video-${Date.now()}.mp4`);
        await writeFile(tempFilePath, buffer);
        console.log(`💾 Saved to temp file: ${tempFilePath}`);

        // Upload to Google AI File Manager
        console.log("1️⃣ Uploading video to Google AI...");
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: videoFile.type,
            displayName: `Land Site Visit - ${surveyNo || 'Unknown'}`,
        });

        console.log(`✅ Uploaded. URI: ${uploadResult.file.uri}`);

        // Poll for processing completion
        console.log("2️⃣ Waiting for Google to process video...");
        let file = await fileManager.getFile(uploadResult.file.name);
        let pollCount = 0;
        const MAX_POLLS = 30; // 30 polls * 2 seconds = 60 seconds timeout

        while (file.state === FileState.PROCESSING) {
            if (pollCount >= MAX_POLLS) {
                throw new Error("Video processing timeout. Please try again with a shorter video.");
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
            file = await fileManager.getFile(uploadResult.file.name);
            pollCount++;
            console.log(`⏳ Processing... (${pollCount * 2}s)`);
        }

        if (file.state === FileState.FAILED) {
            throw new Error("Video processing failed. Please try again.");
        }

        console.log("✅ Video processing complete!");

        // Generate enhanced prompt with context
        const prompt = `
Analyze the uploaded video file for TWO distinct aspects:

1. VISUAL LAND ASSESSMENT:
- Analyze the terrain (Flat, Sloped, Rocky).
- Check for vegetation and boundaries.
- Identify visible infrastructure (poles, roads, etc).
- Assess water presence and boundary clarity.

2. AUDIO TRAFFIC ANALYSIS:
- Listen strictly to the background audio.
- Identify distinct sounds (e.g., 'Heavy honking', 'Birds', 'Highway drone').
- Estimate the Traffic Density based on sound frequency.
- Assign a Noise Level Score (1 = Silent/Rural, 10 = Noisy Junction).

3. EXECUTIVE SITE INTELLIGENCE REPORT:
- Synthesize all findings into 2-3 professional, detailed paragraphs.
- Combine the identity verification status, land record authenticity (Patta details), and site visit findings (visual terrain & audio environment).
- Write this as a cohesive narrative that a buyer would read to understand the overall property value and risks.

Context from seller's verified documents:
- Survey Number: ${surveyNo || 'Not provided'}
- Verified Owner: ${verifiedName || 'Not provided'}
- Land Status: ${landStatus || 'Not provided'}
- Recorded Area: ${totalArea || 'Not provided'}

Return the result as a single JSON object with this exact schema:
{
  "land_quality": {
    "topography": string,
    "soil_type": string,
    "vegetation": string,
    "nearby_infrastructure": string[],
    "water_presence": string,
    "boundary_clarity": string
  },
  "audio_analysis": {
    "detected_sounds": string[],
    "traffic_density": string,
    "noise_pollution_score": number,
    "environment_summary": string
  },
  "overall_verdict": string,
  "suitability_score": number, // 1-10 rating for construction suitability based on visual factors
  "recommendations": string, // Key recommendations for the buyer
  "detailed_report": string // 2-3 paragraph professional narrative report synthesizing all verification data
}
`;

        // Call Gemini with the video
        console.log("3️⃣ Analyzing video with Gemini 3 Flash Preview...");
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            },
            { text: prompt },
        ]);

        const responseText = result.response.text();
        console.log("✅ Received analysis from Gemini");

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanedJson = jsonMatch ? jsonMatch[0] : responseText;

        const parsedResult = JSON.parse(cleanedJson) as VideoAnalysisResult;
        console.log("📊 Parsed video analysis result");

        // Clean up temp file
        if (tempFilePath) {
            await unlink(tempFilePath);
            console.log("🗑️ Cleaned up temp file");
        }

        // Return success response
        return NextResponse.json({
            success: true,
            data: parsedResult,
        });

    } catch (error) {
        console.error("Video Analysis Error:", error);

        // Clean up temp file on error
        if (tempFilePath) {
            try {
                await unlink(tempFilePath);
            } catch (unlinkError) {
                console.error("Failed to clean up temp file:", unlinkError);
            }
        }

        return NextResponse.json(
            {
                error: "Server Error",
                details: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
