# PRD: LandGuard Audio-Visual Site Intelligence (v2.0)

**Date:** 2026-02-05  
**Status:** Ready for Implementation  
**Target Module:** api/video-analysis (Unified Pipeline)

---

## 1. Executive Summary

The "Site Verification" module currently analyzes visual data for land topography and soil quality. This update introduces **Audio Scene Analysis**.

By leveraging the multimodal capabilities of Gemini (which can "hear" video files), we will detect background audio cues—such as vehicle engines, honking, construction noise, or nature sounds—to infer the **Traffic Density** and **Noise Pollution Levels** surrounding the property. This provides the buyer with a holistic understanding of the location's livability without visiting.

---

## 2. Functional Requirements

### 2.1. Unified Analysis Pipeline

We will not run two separate checks. We will send the video **once** and ask Gemini to analyze both the **visual stream** (Land Quality) and the **audio stream** (Traffic/Noise) simultaneously to save cost and time.

### 2.2. Audio Detection Categories

The system must listen for and categorize the following sounds:

- **High Traffic:** Continuous engine drone, frequent honking, heavy truck air brakes.
- **Moderate Traffic:** Occasional passing cars, distant road noise.
- **Low Traffic / Residential:** faint scooter sounds, voices, playing children.
- **Nature / Serene:** Birds chirping, wind, rustling leaves (implies a quiet area).
- **Industrial:** Construction banging, machinery, drilling.

### 2.3. Output Data

The API must return a structured "Environment Report" alongside the land report.

---

## 3. Technical Implementation

### 3.1. API Route Update (app/api/video-analysis/route.ts)

The core logic remains the same (uploading the file), but the **Prompt Engineering** changes significantly.

**New Prompt Structure:**

```
"Analyze the uploaded video file for TWO distinct aspects:

1. VISUAL LAND ASSESSMENT:
   - Analyze the terrain (Flat, Sloped, Rocky).
   - Check for vegetation and boundaries.
   - Identify visible infrastructure (poles, roads).

2. AUDIO TRAFFIC ANALYSIS:
   - Listen strictly to the background audio.
   - Identify distinct sounds (e.g., 'Heavy honking', 'Birds', 'Highway drone').
   - Estimate the Traffic Density based on sound frequency.
   - Assign a Noise Level Score (1 = Silent/Rural, 10 = Noisy Junction).

Return the result as a single JSON object."
```

### 3.2. JSON Response Schema (Updated)

The frontend expects this new structure:

```json
{
  "land_quality": {
    "topography": "Flat",
    "soil_type": "Red Soil",
    "vegetation": "Cleared / Scrub"
  },
  "audio_analysis": {
    "detected_sounds": ["Motorbike accelerating", "Distant bus horn", "Wind"],
    "traffic_density": "Moderate",
    "noise_pollution_score": 4,
    "environment_summary": "Residential area with occasional vehicle movement. Not on a main highway."
  },
  "overall_verdict": "Suitable for Residential Construction"
}
```

---

## 4. Frontend Updates (app/video-analysis/page.tsx)

### 4.1. UI Components

Add a new **"Noise & Environment"** card to the results dashboard.

**Visual Indicator:** A volume bar or "Traffic Light" system.

- 🟢 **Green:** Quiet / Nature Sounds.
- 🟡 **Yellow:** Moderate / Residential Traffic.
- 🔴 **Red:** Heavy Traffic / Industrial Noise.

**Tags:** Display chips for detected sounds (e.g., #Birds, #HeavyTraffic, #Construction).

---

## 5. Development Checklist

- [ ] **Modify API Prompt:** Update the prompt string in route.ts to include the specific audio instructions above.
- [ ] **Type Definitions:** Update your TypeScript interface to include `audio_analysis` fields.
- [ ] **Frontend Card:** Create a UI component to display the "Noise Level Score" (e.g., a progress bar from 1-10).
- [ ] **Testing:**
  - Test 1: Upload a video recorded near a busy road (expect "High Traffic").
  - Test 2: Upload a video recorded in a quiet room or garden (expect "Nature/Low").

---

## Prompt for your Developer (or Gemini)

To implement this immediately, use this prompt:

> "I need to update my `api/video-analysis/route.ts`. Please rewrite the Gemini prompt to perform a multimodal analysis. It should extract **Land Quality** (Visual) AND **Traffic Analysis** (Audio) in a single pass. The output must be valid JSON matching the schema defined in the PRD."
