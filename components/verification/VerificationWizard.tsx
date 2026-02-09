"use client";

import { useState } from "react";
import Step1Identity from "./Step1Identity";
import Step2Patta from "./Step2Patta";
import Step3VideoAnalysis from "./Step3VideoAnalysis";
import VerificationSuccess from "./VerificationSuccess";
import LocationVerifier from "./LocationVerifier";

export interface Step1Data {
    verified_name: string;
    extracted_survey_no: string;
    land_status: string;
    total_area: string;
    district: string;
    confidence_score: number;
}

export interface Step2Data {
    matches: {
        name_matched: boolean;
        survey_matched: boolean;
    };
    land_info: {
        classification: string;
        official_area: string;
        is_safe: boolean;
    };
    map_data: {
        lat: number | null;
        lng: number | null;
        display_address: string;
    };
    geo_target: {
        district_name: string;
        taluk_name: string;
        revenue_village_name: string;
    };
}

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

export default function VerificationWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
    const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
    const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
    const [isLocationVerified, setIsLocationVerified] = useState(false);

    const handleStep1Complete = (data: Step1Data) => {
        setStep1Data(data);
        setCurrentStep(2);
    };

    const handleStep2Complete = (data: Step2Data) => {
        setStep2Data(data);
        setCurrentStep(3);
    };

    const handleStep3Complete = (data: Step3Data) => {
        setStep3Data(data);
        setCurrentStep(4);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setStep1Data(null);
        setStep2Data(null);
        setStep3Data(null);
        setIsLocationVerified(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Progress Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        {/* Step 1 */}
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                1
                            </div>
                            <span className="ml-2 font-medium text-gray-700">Identity</span>
                        </div>

                        {/* Connector */}
                        <div
                            className={`w-24 h-1 mx-4 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        ></div>

                        {/* Step 2 */}
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= 2
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                2
                            </div>
                            <span className="ml-2 font-medium text-gray-700">Land Record</span>
                        </div>

                        {/* Connector */}
                        <div
                            className={`w-24 h-1 mx-4 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        ></div>

                        {/* Step 3 */}
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= 3
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                3
                            </div>
                            <span className="ml-2 font-medium text-gray-700">Video</span>
                        </div>

                        {/* Connector */}
                        <div
                            className={`w-24 h-1 mx-4 ${currentStep >= 4 ? "bg-green-600" : "bg-gray-300"
                                }`}
                        ></div>

                        {/* Step 4 */}
                        <div className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= 4
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                ✓
                            </div>
                            <span className="ml-2 font-medium text-gray-700">Complete</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {currentStep === 1 && (
                        <Step1Identity onComplete={handleStep1Complete} />
                    )}

                    {currentStep === 2 && step1Data && (
                        <Step2Patta
                            step1Data={step1Data}
                            onComplete={handleStep2Complete}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}

                    {currentStep === 3 && step1Data && step2Data && (
                        <div className="space-y-8">
                            {!isLocationVerified ? (
                                <LocationVerifier
                                    geoTarget={step2Data.geo_target}
                                    onVerified={() => setIsLocationVerified(true)}
                                />
                            ) : (
                                <Step3VideoAnalysis
                                    step1Data={step1Data}
                                    step2Data={step2Data}
                                    onComplete={handleStep3Complete}
                                    onBack={() => setIsLocationVerified(false)}
                                />
                            )}
                        </div>
                    )}

                    {currentStep === 4 && step1Data && step2Data && step3Data && (
                        <VerificationSuccess
                            step1Data={step1Data}
                            step2Data={step2Data}
                            step3Data={step3Data}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
