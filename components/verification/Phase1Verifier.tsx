"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

interface VerificationData {
  identity_verification: {
    pan_name: string;
    deed_buyer_name: string;
    match_status: "MATCHED" | "MISMATCH" | "PARTIAL";
    confidence_score: number;
  };
  legal_validity: {
    sub_registrar_seal_found: boolean;
    stamp_paper_detected: boolean;
  };
  data_extraction: {
    survey_number: string;
    district: string;
  };
  debug_visual_description: string;
  overall_verdict: "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
}

interface Phase1VerifierProps {
  onVerificationSuccess?: (_surveyNumber: string) => void;
}

export default function Phase1Verifier({ onVerificationSuccess }: Phase1VerifierProps) {
  const [pan, setPan] = useState<File | null>(null);
  const [deed, setDeed] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState<string>("");
  const [deedFileName, setDeedFileName] = useState<string>("");

  const handlePanChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPan(e.target.files[0]);
      setPanFileName(e.target.files[0].name);
    }
  };

  const handleDeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDeed(e.target.files[0]);
      setDeedFileName(e.target.files[0].name);
    }
  };

  const handleVerify = async () => {
    if (!pan || !deed) {
      setError("Please upload both documents!");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("pan", pan);
    formData.append("deed", deed);

    try {
      const res = await fetch("/api/verify-phase1", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Verification failed");
      }

      setResult(json.data);

      // If successful, pass the extracted Survey No to the parent (for Phase 2)
      if (json.data?.overall_verdict === "APPROVED" && onVerificationSuccess) {
        onVerificationSuccess(json.data.data_extraction.survey_number);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Phase 1: Identity &amp; Legal Check
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">
            1. Upload PAN Card
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePanChange}
            className="w-full text-sm text-gray-500 border rounded p-2 cursor-pointer"
          />
          {panFileName && (
            <p className="text-xs text-gray-600 mt-1">✓ {panFileName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            2. Upload Sale Deed (PDF/Image)
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleDeedChange}
            className="w-full text-sm text-gray-500 border rounded p-2 cursor-pointer"
          />
          {deedFileName && (
            <p className="text-xs text-gray-600 mt-1">✓ {deedFileName}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || !pan || !deed}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? "⚡ Verifying with Gemini 3 Flash..." : "Verify Documents"}
      </button>

      {/* Result Display */}
      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Verification Report</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${result.overall_verdict === "APPROVED"
                ? "bg-green-100 text-green-700"
                : result.overall_verdict === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {result.overall_verdict}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <p className="text-xs text-gray-600 mb-1">Identity Information</p>
              <div className="flex justify-between">
                <span>PAN Name:</span>
                <span className="font-medium">{result.identity_verification?.pan_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Deed Buyer Name:</span>
                <span className="font-medium">{result.identity_verification?.deed_buyer_name}</span>
              </div>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>👤 Name Match:</span>
              <span className={`font-medium ${result.identity_verification?.match_status === "MATCHED"
                ? "text-green-600"
                : result.identity_verification?.match_status === "MISMATCH"
                  ? "text-red-600"
                  : "text-yellow-600"
                }`}>
                {result.identity_verification?.match_status}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Confidence Score:</span>
              <span className="font-medium">
                {result.identity_verification?.confidence_score}%
              </span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>🏛️ Sub-Registrar Stamp:</span>
              <span className="font-medium">
                {result.legal_validity?.sub_registrar_seal_found
                  ? "✅ Verified"
                  : "❌ Missing"}
              </span>
            </div>

            <div className="flex justify-between pb-2">
              <span>📄 Stamp Paper:</span>
              <span className="font-medium">
                {result.legal_validity?.stamp_paper_detected
                  ? "✅ Detected"
                  : "⚠️ Not Detected"}
              </span>
            </div>

            <div className="bg-blue-50 p-3 rounded mt-4">
              <span className="block text-xs text-blue-600 font-bold uppercase">
                Extracted for Phase 2
              </span>
              <div className="mt-2">
                <p className="text-xs text-gray-600">Survey Number:</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-lg text-blue-900">
                    {result.data_extraction?.survey_number || "Not Found"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.data_extraction?.district && `• ${result.data_extraction.district}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded mt-3 border-l-4 border-gray-400">
              <span className="block text-xs text-gray-600 font-bold uppercase mb-1">
                🔍 Debug Info - Seal Detection
              </span>
              <p className="text-xs text-gray-700 italic">
                {result.debug_visual_description || "No description available"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
