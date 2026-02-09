import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { step1Data, step2Data, step3Data } = body;

        if (!step1Data || !step2Data || !step3Data) {
            return NextResponse.json(
                { success: false, error: "All verification steps must be completed." },
                { status: 400 }
            );
        }

        // Save verification record to database
        const verification = await prisma.verification.create({
            data: {
                userId: userId,
                status: "COMPLETED",

                // Step 1: Identity
                verifiedName: step1Data.verified_name,
                surveyNo: step1Data.extracted_survey_no,
                landStatus: step1Data.land_status,
                totalArea: step1Data.total_area,
                district: step1Data.district,
                confidenceScore: step1Data.confidence_score,

                // Step 2: Land Record
                nameMatched: step2Data.matches.name_matched,
                surveyMatched: step2Data.matches.survey_matched,
                landClassification: step2Data.land_info.classification,
                officialArea: step2Data.land_info.official_area,
                isSafeLand: step2Data.land_info.is_safe,
                displayAddress: step2Data.map_data.display_address,
                districtName: step2Data.geo_target?.district_name,
                talukName: step2Data.geo_target?.taluk_name,
                villageeName: step2Data.geo_target?.revenue_village_name,

                // Step 3: Video Analysis
                topography: step3Data.land_quality.topography,
                soilType: step3Data.land_quality.soil_type,
                vegetation: step3Data.land_quality.vegetation,
                nearbyInfra: step3Data.land_quality.nearby_infrastructure,
                waterPresence: step3Data.land_quality.water_presence,
                boundaryClarity: step3Data.land_quality.boundary_clarity,
                detectedSounds: step3Data.audio_analysis.detected_sounds,
                trafficDensity: step3Data.audio_analysis.traffic_density,
                noiseScore: step3Data.audio_analysis.noise_pollution_score,
                audioSummary: step3Data.audio_analysis.environment_summary,
                overallVerdict: step3Data.overall_verdict,
                suitabilityScore: step3Data.suitability_score,
                recommendations: step3Data.recommendations,
                detailedReport: step3Data.detailed_report,
            },
        });

        // Update user's verified status
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
            },
        });

        console.log(`✅ Verification saved for user ${userId}: ${verification.id}`);

        return NextResponse.json({
            success: true,
            verificationId: verification.id,
            message: "Verification saved successfully.",
        });

    } catch (error) {
        console.error("Save Verification Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to save verification",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
