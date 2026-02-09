import { NextResponse } from "next/server";
import { verifyIdentityAndDeed } from "@/lib/verification/verifyPhase1";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const panFile = formData.get("pan") as File | null;
        const deedFile = formData.get("deed") as File | null;

        if (!panFile || !deedFile) {
            return NextResponse.json(
                { error: "Both PAN and Deed are required" },
                { status: 400 }
            );
        }

        // Convert files to Buffers
        const panBuffer = Buffer.from(await panFile.arrayBuffer());
        const deedBuffer = Buffer.from(await deedFile.arrayBuffer());

        // Call Gemini 3 for Phase 1 verification
        const verificationResult = await verifyIdentityAndDeed(panBuffer, deedBuffer);

        // Check if there was an error
        if ("error" in verificationResult) {
            return NextResponse.json(
                { success: false, error: verificationResult.error },
                { status: 500 }
            );
        }

        // Check identity match status
        const { identity_verification, data_extraction } = verificationResult;

        if (identity_verification.match_status === "MISMATCH") {
            return NextResponse.json({
                success: false,
                error: "Identity mismatch",
                message: "The name on the Deed does not match your PAN Card.",
                details: identity_verification.fuzzy_match_explanation
            }, { status: 400 });
        }

        // Success - return verified data for Step 2
        // CRITICAL: verified_name should be the PURCHASER (PAN card holder),
        // NOT the seller. The Patta should show the Purchaser's name.
        return NextResponse.json({
            success: true,
            phase1_status: "VERIFIED",
            data: {
                verified_name: identity_verification.pan_name, // Purchaser = PAN card holder
                extracted_survey_no: data_extraction.survey_number,
                land_status: data_extraction.land_status,
                total_area: data_extraction.total_area,
                district: data_extraction.district,
                confidence_score: identity_verification.confidence_score,
                // Generate a simple session token (optional - for added security)
                token: Buffer.from(`${Date.now()}-${data_extraction.survey_number}`).toString('base64')
            }
        });

    } catch (error) {
        console.error("Step 1 Verification API Error:", error);
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
