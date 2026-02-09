"use client";

import { useState, FormEvent } from "react";
import { Step1Data, Step2Data } from "./VerificationWizard";

interface Props {
    step1Data: Step1Data;
    onComplete: (_data: Step2Data) => void;
    onBack: () => void;
}

export default function Step2Patta({ step1Data, onComplete, onBack }: Props) {
    const [pattaFile, setPattaFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!pattaFile) {
            setError("Please upload the Patta Chitta document");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("patta", pattaFile);
            formData.append("verified_name", step1Data.verified_name);
            formData.append("survey_no", step1Data.extracted_survey_no);
            formData.append("land_status", step1Data.land_status);
            formData.append("total_area", step1Data.total_area);

            const response = await fetch("/api/verify/step2", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                setError(result.message || result.error || "Verification failed");
                setLoading(false);
                return;
            }

            // Success - pass data to parent
            onComplete(result.data);
        } catch (err) {
            setError("Network error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Step 2: Government Record Verification
            </h2>
            <p className="text-gray-600 mb-6">
                Upload your Patta Chitta to verify land ownership against government records.
            </p>

            {/* Display Verified Data from Step 1 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">✓ Identity Verified</h3>
                <div className="space-y-1 text-sm text-green-700">
                    <p>
                        <strong>Purchaser (New Owner):</strong> {step1Data.verified_name}
                    </p>
                    <p>
                        <strong>Survey No:</strong> {step1Data.extracted_survey_no}
                    </p>
                    <p>
                        <strong>Area:</strong> {step1Data.total_area}
                    </p>
                    <p>
                        <strong>Status:</strong> {step1Data.land_status}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patta Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patta Chitta Document <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPattaFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              cursor-pointer"
                    />
                    {pattaFile && (
                        <p className="mt-2 text-sm text-green-600">✓ {pattaFile.name}</p>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">❌ {error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold
              hover:bg-gray-300 transition-colors duration-200"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !pattaFile}
                        className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold
              hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors duration-200"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Cross-referencing with Government Records...
                            </span>
                        ) : (
                            "Verify Land Record"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
