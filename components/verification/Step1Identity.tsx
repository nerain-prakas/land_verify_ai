"use client";

import { useState, FormEvent } from "react";
import { Step1Data } from "./VerificationWizard";

interface Props {
    onComplete: (_data: Step1Data) => void;
}

export default function Step1Identity({ onComplete }: Props) {
    const [panFile, setPanFile] = useState<File | null>(null);
    const [deedFile, setDeedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!panFile || !deedFile) {
            setError("Please upload both PAN Card and Sale Deed");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("pan", panFile);
            formData.append("deed", deedFile);

            const response = await fetch("/api/verify/step1", {
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
            console.error(err);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Step 1: Identity Verification
            </h2>
            <p className="text-gray-600 mb-6">
                Upload your PAN Card and the Sale Deed to verify your identity as the buyer.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PAN Card Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Card <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
                    />
                    {panFile && (
                        <p className="mt-2 text-sm text-green-600">✓ {panFile.name}</p>
                    )}
                </div>

                {/* Deed Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Deed <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setDeedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
                    />
                    {deedFile && (
                        <p className="mt-2 text-sm text-green-600">✓ {deedFile.name}</p>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">❌ {error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !panFile || !deedFile}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
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
                            Analyzing Identity Documents...
                        </span>
                    ) : (
                        "Verify Identity"
                    )}
                </button>
            </form>
        </div>
    );
}
