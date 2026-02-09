import { NextResponse } from "next/server";
import { verifyDeedAgainstPatta } from "@/lib/verification/verifyPhase2";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const pattaFile = formData.get("patta") as File | null;

        // Data from Step 1 (passed from frontend state)
        const verifiedName = formData.get("verified_name") as string | null;
        const surveyNo = formData.get("survey_no") as string | null;
        const landStatus = formData.get("land_status") as string | null;
        const totalArea = formData.get("total_area") as string | null;

        if (!pattaFile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Patta Chitta document is required"
                },
                { status: 400 }
            );
        }

        if (!verifiedName || !surveyNo) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Step 1 verification data is missing. Please complete Step 1 first."
                },
                { status: 400 }
            );
        }

        // Convert file to Buffer
        const pattaBuffer = Buffer.from(await pattaFile.arrayBuffer());

        // Call Gemini 3 Phase 2
        const verificationResult = await verifyDeedAgainstPatta(pattaBuffer, {
            deedName: verifiedName,
            deedSurveyNo: surveyNo,
            deedLandStatus: landStatus || undefined,
            deedTotalArea: totalArea || undefined
        });

        // Check if there was an error
        if ("error" in verificationResult) {
            return NextResponse.json(
                { success: false, error: verificationResult.error },
                { status: 500 }
            );
        }

        const { status, matches, land_facts, rejection_reason } = verificationResult;

        // Handle different verification outcomes
        if (status === "REJECTED") {
            return NextResponse.json({
                success: false,
                phase2_status: "REJECTED",
                error: rejection_reason || "Verification failed",
                message: rejection_reason || "The Patta record does not match the Deed information."
            }, { status: 400 });
        }

        // Check for government land (HARD REJECT)
        if (land_facts.is_government_land) {
            return NextResponse.json({
                success: false,
                phase2_status: "REJECTED",
                error: "Government Land Detected",
                message: "Alert: This land is classified as Government Property and cannot be sold.",
                risk_level: "HIGH"
            }, { status: 400 });
        }

        // SUCCESS or WARNING
        return NextResponse.json({
            success: true,
            final_status: status, // "APPROVED" or "WARNING"
            data: {
                matches: {
                    name_matched: matches.name_match,
                    survey_matched: matches.survey_match
                },
                land_info: {
                    classification: land_facts.classification,
                    official_area: land_facts.official_area_text,
                    is_safe: !land_facts.is_government_land
                },
                geo_target: verificationResult.geo_target,
                map_data: {
                    // Mock coordinates - in production, query from database based on survey number
                    lat: null,
                    lng: null,
                    display_address: `${verificationResult.geo_target.revenue_village_name}, ${verificationResult.geo_target.taluk_name}, ${verificationResult.geo_target.district_name}`
                },
                warning_message: status === "WARNING" ? rejection_reason : null
            }
        });

    } catch (error) {
        console.error("Step 2 Verification API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Server Error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
