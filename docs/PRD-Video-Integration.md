# PRD: LandGuard Video Analysis Module Integration (UPDATED)

**Date:** 2026-02-05  
**Status:** Ready for Implementation  
**Source Location:** `./VIDEO-VERIFY/` (Internal reference folder)  
**Target Location:** `./app/api/verify/step3/` & `./components/verification/`

---

## 1. Objective

To integrate the standalone video processing logic currently residing in the `./VIDEO-VERIFY` folder **as Step 3** in the existing verification wizard workflow. After successful completion of identity verification (Step 1) and government record verification (Step 2), sellers will be prompted to upload a site visit video for AI-generated land quality assessment using Gemini's multimodal capabilities.

---

## 2. Current vs. New Workflow

### Current Workflow (2 Steps)
1. **Step 1:** Identity Verification (PAN + Sale Deed)
2. **Step 2:** Government Record Verification (Patta Chitta)
3. **Success Screen:** Shows verification summary

### New Workflow (3 Steps)
1. **Step 1:** Identity Verification (PAN + Sale Deed)
2. **Step 2:** Government Record Verification (Patta Chitta)
3. **Step 3 (NEW):** Video Site Analysis ← Video upload & Gemini analysis
4. **Success Screen:** Shows comprehensive verification including video analysis

---

## 3. Technical Migration Plan

### 3.1. Source Code Analysis (The "VIDEO-VERIFY" folder)

**Current State:** The folder contains a standalone Node.js script (`test.js`) that:

- Reads a local video file (`test-land.mp4`)
- Uploads it to Google AI File Manager
- Polls for processing completion
- Sends a prompt to Gemini 3 Flash Preview
- Logs the result to the console

**Migration Goal:** Integrate this logic as Step 3 in the existing verification wizard.

### 3.2. New Architecture Definition

#### A. Backend (API Route)
**Path:** `app/api/verify/step3/route.ts`

**Responsibilities:**
- Receive video file via FormData (following Step1/Step2 pattern)
- Receive context data from previous steps (survey number, verified name, land status, area)
- Upload video to Google AI File Manager
- Poll for processing completion (every 2 seconds until ACTIVE)
- Call **gemini-3-flash-preview** model with enhanced prompt
- Return structured JSON response with land analysis

#### B. Frontend (Step Component)
**Path:** `components/verification/Step3VideoAnalysis.tsx`

**Features:**
- Display verified data from Step 1 & 2 (survey number, name, area)
- Video upload UI with drag-and-drop support
- File validation (type: .mp4, .mov, .avi | size: max 100MB)
- Multi-stage progress indicator:
  - Stage 1: "Uploading video to server..."
  - Stage 2: "Processing with Google AI..." (15-30 seconds)
  - Stage 3: "Analyzing land features..."
- Structured results display with badges and visual indicators
- "Back" and "Continue to Summary" action buttons

#### C. Wizard Integration
**Files to Modify:**
- `components/VerificationWizard.tsx` - Add Step 3 to stepper UI and flow
- `components/verification/VerificationSuccess.tsx` - Display video analysis results

---

## 4. Prompt Engineering (Migration)

### Source Prompt (from test.js):
```
"Analyze this land video. Tell me the Soil Type, Vegetation, and if it's good for building."
```

### Enhanced Prompt with Context:
```
Analyze this land site visit video in detail.

Context from seller's verified documents:
- Survey Number: {survey_no}
- Verified Owner: {name}
- Land Status: {land_status}
- Recorded Area: {area}

Provide a comprehensive assessment in JSON format with these exact keys:
{
  "topography": "flat" | "sloped" | "hilly" | "uneven" | "mixed",
  "soil_type": "clay" | "sandy" | "loamy" | "rocky" | "black soil",
  "vegetation": "detailed description of coverage and types",
  "nearby_infrastructure": ["roads", "power lines", "water sources", ...],
  "water_presence": "description of water sources or drainage",
  "boundary_clarity": "description of boundary visibility",
  "suitability_score": 1-10,
  "recommendations": "key recommendations or concerns for buyer"
}

Be specific and detailed in your observations.
```

**Key Enhancements:**
1. **Contextual Information:** Survey number and verified owner included for cross-referencing
2. **Structured JSON Output:** Easier to parse and display in UI
3. **Additional Fields:** Boundary clarity, infrastructure detection, water presence
4. **Suitability Score:** Quantitative 1-10 rating for quick assessment

---

## 5. Model Requirement

> **CRITICAL:** Video analysis MUST use `gemini-3-flash-preview` model.  
> This is **non-negotiable** and will be hardcoded in the implementation.

---

## 6. Acceptance Criteria

### Functional Requirements
- ✅ Step 3 appears after successful Step 2 completion
- ✅ User can upload video files (.mp4, .mov, .avi)
- ✅ File size validation prevents uploads > 100MB
- ✅ Progress indicator shows all 3 stages clearly
- ✅ Video is analyzed using `gemini-3-flash-preview` model
- ✅ Structured JSON response displays in readable format
- ✅ User can navigate back to Step 2 or continue to Success screen
- ✅ Success screen shows video analysis alongside other verification data

### Technical Requirements
- ✅ API follows existing Step1/Step2 pattern for consistency
- ✅ Temporary files are cleaned up after processing
- ✅ Comprehensive error handling (invalid file, upload failure, API errors)
- ✅ Stepper UI updated to show 4 steps (Identity → Land Record → Video → Complete)

### UX Requirements
- ✅ Clear context display from Step 1 & 2 data
- ✅ User-friendly error messages for all failure scenarios
- ✅ Loading states prevent user confusion during 15-30 second processing
- ✅ Results are visually appealing with badges, icons, and color coding

---

## 7. Non-Functional Requirements

### Performance
- Handle videos up to 100MB
- Process videos within 60 seconds (Google's typical range: 15-30s)

### Security
- Validate file types and sizes on both client and server
- Clean up temporary files after processing
- Follow zero-storage policy (video not persisted)

### Reliability
- Graceful error handling with retry options
- Clear error messages for debugging
- Polling timeout after 60 seconds to prevent infinite waits

---

## 8. Out of Scope (for this iteration)

- Video compression before upload
- Support for files > 100MB
- Video trimming or editing capabilities
- Multiple video uploads per verification
- Video storage for later review
- Making Step 3 optional (it will be mandatory)

---

## 9. Success Metrics

- Complete verification wizard flow (Steps 1-3) functions without errors
- Video analysis results match expected JSON structure
- `gemini-3-flash-preview` model is confirmed in use
- All error scenarios handled gracefully
- User can complete full verification within 5 minutes (including video processing)

