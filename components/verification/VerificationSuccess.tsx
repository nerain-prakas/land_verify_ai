"use client";

import { useState, useEffect, useRef } from "react";
import { Step1Data, Step2Data, Step3Data } from "./VerificationWizard";

interface Props {
    step1Data: Step1Data;
    step2Data: Step2Data;
    step3Data: Step3Data;
    onReset: () => void;
}

export default function VerificationSuccess({ step1Data, step2Data, step3Data, onReset }: Props) {
    const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saving");
    const [saveError, setSaveError] = useState<string | null>(null);
    const savedRef = useRef(false);

    useEffect(() => {
        if (savedRef.current) return;
        savedRef.current = true;

        async function saveVerification() {
            try {
                const response = await fetch("/api/verify/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ step1Data, step2Data, step3Data }),
                });

                const result = await response.json();

                if (result.success) {
                    setSaveStatus("saved");
                } else {
                    setSaveStatus("error");
                    setSaveError(result.error || "Failed to save verification");
                }
            } catch (err) {
                setSaveStatus("error");
                setSaveError("Network error. Verification data could not be saved.");
                console.error("Save verification error:", err);
            }
        }

        saveVerification();
    }, [step1Data, step2Data, step3Data]);
    return (
        <div className="text-center">
            {/* Success Icon */}
            <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                        className="w-12 h-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Verification Complete!
            </h2>
            <p className="text-gray-600 mb-4">
                Your identity, land ownership, and site video have been successfully verified.
            </p>

            {/* Database Save Status */}
            {saveStatus === "saving" && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm text-blue-700">Saving verification to database...</span>
                </div>
            )}
            {saveStatus === "saved" && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-sm text-green-700">✓ Verification saved to database successfully</span>
                </div>
            )}
            {saveStatus === "error" && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-sm text-red-700">⚠ {saveError || "Failed to save verification"}</span>
                </div>
            )}

            {/* Verification Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Verification Summary</h3>

                {/* Detailed Narrative Report */}
                <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Detailed Site Intelligence Report
                    </h4>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        {step3Data.detailed_report.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Identity */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Owner Name</p>
                        <p className="font-semibold text-gray-800">{step1Data.verified_name}</p>
                    </div>

                    {/* Survey Number */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Survey Number</p>
                        <p className="font-semibold text-gray-800">{step1Data.extracted_survey_no}</p>
                    </div>

                    {/* Land Classification */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Land Classification</p>
                        <p className="font-semibold text-gray-800">{step2Data.land_info.classification}</p>
                    </div>

                    {/* Area */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Area</p>
                        <p className="font-semibold text-gray-800">{step1Data.total_area}</p>
                    </div>

                    {/* Location */}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="font-semibold text-gray-800">{step2Data.map_data.display_address}</p>
                    </div>

                    {/* Match Status */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${step2Data.matches.name_matched ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {step2Data.matches.name_matched ? "✓ Name Matched" : "⚠ Name Partial Match"}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${step2Data.matches.survey_matched ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {step2Data.matches.survey_matched ? "✓ Survey Matched" : "⚠ Survey Partial Match"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${step2Data.land_info.is_safe ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                {step2Data.land_info.is_safe ? "✓ Private Land" : "⚠ Government Risk Detected"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Analysis Results */}
                <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-800 mb-4">🎥 Video Site Analysis (Audio & Visual)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Suitability Score */}
                        <div className="col-span-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Building Suitability</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-indigo-900">
                                    {step3Data.suitability_score}/10
                                </span>
                                <div className="flex-1 flex gap-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 flex-1 rounded ${i < step3Data.suitability_score
                                                ? "bg-indigo-500"
                                                : "bg-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Topography & Soil */}
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Topography</p>
                            <p className="font-semibold text-gray-800 capitalize">{step3Data.land_quality.topography}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Soil Type</p>
                            <p className="font-semibold text-gray-800 capitalize">{step3Data.land_quality.soil_type}</p>
                        </div>

                        {/* Audio Analysis Summary */}
                        <div className="col-span-2 bg-gray-100 rounded p-3">
                            <p className="text-xs text-gray-600 mb-1">Audio Environment</p>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">
                                    {step3Data.audio_analysis.traffic_density} Traffic
                                </span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    Noise Score: {step3Data.audio_analysis.noise_pollution_score}/10
                                </span>
                            </div>
                        </div>

                        {/* Infrastructure */}
                        {step3Data.land_quality.nearby_infrastructure.length > 0 && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-600 mb-2">Nearby Infrastructure</p>
                                <div className="flex flex-wrap gap-2">
                                    {step3Data.land_quality.nearby_infrastructure.map((item, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="col-span-2 bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                            <p className="text-xs font-semibold text-orange-800 mb-1">Recommendations</p>
                            <p className="text-sm text-orange-900">{step3Data.recommendations}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={onReset}
                    className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold
            hover:bg-gray-300 transition-colors duration-200"
                >
                    Verify Another Property
                </button>
                <button
                    className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold
            hover:bg-green-700 transition-colors duration-200
            flex items-center gap-2"
                >
                    Proceed to Map Listing
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
