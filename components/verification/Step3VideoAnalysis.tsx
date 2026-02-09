"use client";

import { useState } from "react";
import { Step1Data, Step2Data } from "./VerificationWizard";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as Progress from "@radix-ui/react-progress";

export interface Step3Data {
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
        traffic_density: string;
        noise_pollution_score: number;
        environment_summary: string;
    };
    overall_verdict: string;
    suitability_score: number;
    recommendations: string;
    detailed_report: string;
}

interface Props {
    step1Data: Step1Data;
    step2Data: Step2Data;
    onComplete: (_data: Step3Data) => void;
    onBack: () => void;
}

export default function Step3VideoAnalysis({ step1Data, onComplete, onBack }: Props) {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressStage, setProgressStage] = useState("");
    const [result, setResult] = useState<Step3Data | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file size (100MB max)
        const MAX_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            toast.error("File size must be under 100MB");
            return;
        }

        // Validate file type
        const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a video file (.mp4, .mov, .avi)");
            return;
        }

        setVideoFile(file);
        setError(null);
        setResult(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/mp4': ['.mp4'],
            'video/quicktime': ['.mov'],
            'video/x-msvideo': ['.avi']
        },
        maxSize: 100 * 1024 * 1024,
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!videoFile) {
            setError("Please upload a video file");
            return;
        }

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            // Stage 1: Uploading
            setProgressStage("📤 Uploading video to server...");
            setProgress(10);

            const formData = new FormData();
            formData.append("video", videoFile);
            formData.append("survey_no", step1Data.extracted_survey_no);
            formData.append("verified_name", step1Data.verified_name);
            formData.append("land_status", step1Data.land_status);
            formData.append("total_area", step1Data.total_area);

            setProgress(20);

            // Stage 2: Processing
            setProgressStage("🤖 Processing with Google AI...");
            setProgress(30);

            const response = await fetch("/api/verify/step3", {
                method: "POST",
                body: formData,
            });

            // Simulate progress during upload/processing
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 80) {
                        clearInterval(progressInterval);
                        return 80;
                    }
                    return prev + 2;
                });
            }, 500);

            const data = await response.json();
            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error(data.error || data.details || "Video analysis failed");
            }

            // Stage 3: Complete
            setProgressStage("🔍 Analysis complete!");
            setProgress(100);

            setResult(data.data);
            toast.success("Video analysis completed successfully!");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
            toast.error("Failed to analyze video");
            setProgress(0);
            setProgressStage("");
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (result) {
            onComplete(result);
        }
    };

    const getSuitabilityColor = (score: number) => {
        if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getNoiseColor = (score: number) => {
        if (score <= 3) return "text-green-600 bg-green-50 border-green-200";
        if (score <= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getNoiseLabel = (score: number) => {
        if (score <= 3) return "Quiet / Natural";
        if (score <= 6) return "Moderate / Residential";
        return "Heavy / Industrial";
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Step 3: Video Site Analysis
            </h2>
            <p className="text-gray-600 mb-6">
                Upload a video walkthrough of the land site for AI-powered quality assessment (Audio & Visual).
            </p>

            {/* Display Verified Data from Previous Steps */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">✓ Verification Progress</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                    <div>
                        <strong>Verified Owner:</strong> {step1Data.verified_name}
                    </div>
                    <div>
                        <strong>Survey No:</strong> {step1Data.extracted_survey_no}
                    </div>
                    <div>
                        <strong>Area:</strong> {step1Data.total_area}
                    </div>
                    <div>
                        <strong>Status:</strong> {step1Data.land_status}
                    </div>
                </div>
            </div>

            {/* Video Upload Section */}
            {!result && (
                <div className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="space-y-2">
                            <div className="text-4xl">🎥</div>
                            {videoFile ? (
                                <div>
                                    <p className="text-green-600 font-medium">✓ {videoFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setVideoFile(null);
                                        }}
                                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : isDragActive ? (
                                <p className="text-indigo-600 font-medium">Drop video here...</p>
                            ) : (
                                <div>
                                    <p className="text-gray-700 font-medium">
                                        Drag & drop video here, or click to select
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Accepts .mp4, .mov, .avi (max 100MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    {loading && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">{progressStage}</span>
                                <span className="text-gray-500">{progress}%</span>
                            </div>
                            <Progress.Root
                                className="relative overflow-hidden bg-gray-200 rounded-full h-3"
                                value={progress}
                            >
                                <Progress.Indicator
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${100 - progress}%)` }}
                                />
                            </Progress.Root>
                            <p className="text-xs text-gray-500 text-center">
                                This may take 15-30 seconds. Please wait...
                            </p>
                        </div>
                    )}

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
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold
                                hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !videoFile}
                            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold
                                hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                                transition-colors duration-200"
                        >
                            {loading ? "Analyzing..." : "Analyze Video"}
                        </button>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="space-y-6">
                    {/* Suitability Score - Prominent Display */}
                    <div className={`border-2 rounded-lg p-6 text-center ${getSuitabilityColor(result.suitability_score)}`}>
                        <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                            Building Suitability Score
                        </p>
                        <div className="text-5xl font-bold mb-2">
                            {result.suitability_score}/10
                        </div>
                        <div className="flex justify-center gap-1 mt-3">
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-8 h-2 rounded ${i < result.suitability_score
                                        ? "bg-current opacity-100"
                                        : "bg-gray-300 opacity-50"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Audio & Environment Analysis Card */}
                    <div className={`border-2 rounded-lg p-6 ${getNoiseColor(result.audio_analysis.noise_pollution_score)}`}>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            🔊 Audio Environment Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold uppercase mb-1">Noise Level Score</p>
                                <div className="text-3xl font-bold mb-1">
                                    {result.audio_analysis.noise_pollution_score}/10
                                </div>
                                <p className="text-sm font-medium">
                                    {getNoiseLabel(result.audio_analysis.noise_pollution_score)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase mb-1">Traffic Density</p>
                                <p className="text-xl font-bold capitalize">{result.audio_analysis.traffic_density}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                            <p className="text-sm font-medium mb-2">Detected Sounds:</p>
                            <div className="flex flex-wrap gap-2">
                                {result.audio_analysis.detected_sounds.map((sound, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm">
                                        #{sound}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm italic opacity-90">
                                &quot;{result.audio_analysis.environment_summary}&quot;
                            </p>
                        </div>
                    </div>

                    {/* Analysis Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Topography</p>
                            <p className="text-lg font-medium text-blue-900 capitalize">{result.land_quality.topography}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Soil Type</p>
                            <p className="text-lg font-medium text-amber-900 capitalize">{result.land_quality.soil_type}</p>
                        </div>
                    </div>

                    {/* Vegetation */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-green-600 uppercase mb-2">🌿 Vegetation</p>
                        <p className="text-sm text-green-900">{result.land_quality.vegetation}</p>
                    </div>

                    {/* Infrastructure */}
                    {result.land_quality.nearby_infrastructure.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-purple-600 uppercase mb-2">
                                🏗️ Nearby Infrastructure
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.land_quality.nearby_infrastructure.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Water Presence */}
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-cyan-600 uppercase mb-2">💧 Water Presence</p>
                        <p className="text-sm text-cyan-900">{result.land_quality.water_presence}</p>
                    </div>

                    {/* Boundary Clarity */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-2">📏 Boundary Clarity</p>
                        <p className="text-sm text-slate-900">{result.land_quality.boundary_clarity}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                        <p className="text-sm font-semibold text-orange-800 mb-2">⚠️ Recommendations</p>
                        <p className="text-sm text-orange-900">{result.recommendations}</p>
                    </div>

                    {/* Continue Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setResult(null);
                                setVideoFile(null);
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold
                                hover:bg-gray-300 transition-colors duration-200"
                        >
                            ← Re-analyze
                        </button>
                        <button
                            onClick={handleContinue}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold
                                hover:bg-green-700 transition-colors duration-200"
                        >
                            Continue to Summary →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
