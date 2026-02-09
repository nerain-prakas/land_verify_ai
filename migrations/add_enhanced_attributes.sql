-- Enhanced Land Listing Attributes Migration
-- Run this in Supabase SQL Editor or via Prisma

-- Core AI Verification
ALTER TABLE land_listings 
ADD COLUMN IF NOT EXISTS ai_verification_score NUMERIC(3,2) CHECK (ai_verification_score >= 0 AND ai_verification_score <= 1),
ADD COLUMN IF NOT EXISTS document_extracted JSONB,
ADD COLUMN IF NOT EXISTS boundary_match_pct NUMERIC(3,1) CHECK (boundary_match_pct >= 0 AND boundary_match_pct <= 100);

-- Video Storage & Analysis
ALTER TABLE land_listings
ADD COLUMN IF NOT EXISTS noise_level_db NUMERIC(4,1) CHECK (noise_level_db >= 0 AND noise_level_db <= 200),
ADD COLUMN IF NOT EXISTS accessibility_score NUMERIC(3,2) CHECK (accessibility_score >= 0 AND accessibility_score <= 1),
ADD COLUMN IF NOT EXISTS terrain_class TEXT;

-- Land Attributes
ALTER TABLE land_listings
ADD COLUMN IF NOT EXISTS land_topography TEXT,
ADD COLUMN IF NOT EXISTS soil_color TEXT,
ADD COLUMN IF NOT EXISTS soil_texture TEXT,
ADD COLUMN IF NOT EXISTS water_source TEXT,
ADD COLUMN IF NOT EXISTS fencing_status TEXT,
ADD COLUMN IF NOT EXISTS crops_visible TEXT[];

-- House Attributes (Exterior)
ALTER TABLE land_listings
ADD COLUMN IF NOT EXISTS has_structure_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS house_exterior_score NUMERIC(3,2) CHECK (house_exterior_score >= 0 AND house_exterior_score <= 1),
ADD COLUMN IF NOT EXISTS house_style TEXT,
ADD COLUMN IF NOT EXISTS house_wall_color TEXT,
ADD COLUMN IF NOT EXISTS house_paint_freshness TEXT,
ADD COLUMN IF NOT EXISTS wall_material TEXT,
ADD COLUMN IF NOT EXISTS floors_visible INTEGER CHECK (floors_visible >= 0),
ADD COLUMN IF NOT EXISTS house_extensions TEXT[];

-- Nearby Facilities (OpenStreetMap 1km radius)
ALTER TABLE land_listings
ADD COLUMN IF NOT EXISTS schools_nearby_count INTEGER DEFAULT 0 CHECK (schools_nearby_count >= 0),
ADD COLUMN IF NOT EXISTS hospitals_nearby_count INTEGER DEFAULT 0 CHECK (hospitals_nearby_count >= 0),
ADD COLUMN IF NOT EXISTS markets_nearby_count INTEGER DEFAULT 0 CHECK (markets_nearby_count >= 0),
ADD COLUMN IF NOT EXISTS distance_to_nearest_road_m INTEGER CHECK (distance_to_nearest_road_m >= 0);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_land_listings_ai_verification_score ON land_listings(ai_verification_score);
CREATE INDEX IF NOT EXISTS idx_land_listings_boundary_match_pct ON land_listings(boundary_match_pct);
CREATE INDEX IF NOT EXISTS idx_land_listings_noise_level_db ON land_listings(noise_level_db);
CREATE INDEX IF NOT EXISTS idx_land_listings_accessibility_score ON land_listings(accessibility_score);
CREATE INDEX IF NOT EXISTS idx_land_listings_terrain_class ON land_listings(terrain_class);
CREATE INDEX IF NOT EXISTS idx_land_listings_has_structure_detected ON land_listings(has_structure_detected);
CREATE INDEX IF NOT EXISTS idx_land_listings_schools_nearby_count ON land_listings(schools_nearby_count);
CREATE INDEX IF NOT EXISTS idx_land_listings_hospitals_nearby_count ON land_listings(hospitals_nearby_count);

-- Create GIN index for JSONB columns for fast querying
CREATE INDEX IF NOT EXISTS idx_land_listings_document_extracted_gin ON land_listings USING gin(document_extracted);

-- Add comments for documentation
COMMENT ON COLUMN land_listings.ai_verification_score IS 'Overall AI verification confidence score (0.00-1.00)';
COMMENT ON COLUMN land_listings.document_extracted IS 'JSON data extracted from land certificate via Gemini OCR';
COMMENT ON COLUMN land_listings.boundary_match_pct IS 'Percentage match between video boundaries and certificate (0-100)';
COMMENT ON COLUMN land_listings.noise_level_db IS 'Average noise level in decibels detected in video';
COMMENT ON COLUMN land_listings.accessibility_score IS 'Road accessibility score from video analysis (0.00-1.00)';
COMMENT ON COLUMN land_listings.terrain_class IS 'Terrain classification: flat, hilly, sloped, coastal, wooded';
COMMENT ON COLUMN land_listings.land_topography IS 'Detailed topography description from video';
COMMENT ON COLUMN land_listings.soil_color IS 'Soil color detected in video (e.g., red, black, brown)';
COMMENT ON COLUMN land_listings.soil_texture IS 'Soil texture: clay, loam, sandy, etc.';
COMMENT ON COLUMN land_listings.water_source IS 'Water source detected: well, pond, stream, river, none';
COMMENT ON COLUMN land_listings.fencing_status IS 'Fencing status: none, partial, complete, damaged';
COMMENT ON COLUMN land_listings.crops_visible IS 'Array of crops visible in video';
COMMENT ON COLUMN land_listings.has_structure_detected IS 'Whether any house/building structure detected in video';
COMMENT ON COLUMN land_listings.house_exterior_score IS 'House exterior condition score (0.00-1.00)';
COMMENT ON COLUMN land_listings.house_style IS 'House architectural style detected';
COMMENT ON COLUMN land_listings.house_wall_color IS 'Exterior wall color';
COMMENT ON COLUMN land_listings.house_paint_freshness IS 'Paint condition: fresh, faded, peeling, none';
COMMENT ON COLUMN land_listings.wall_material IS 'Wall material: brick, concrete, wood, etc.';
COMMENT ON COLUMN land_listings.floors_visible IS 'Number of floors visible from exterior';
COMMENT ON COLUMN land_listings.house_extensions IS 'Array of extensions: porch, balcony, garage, etc.';
COMMENT ON COLUMN land_listings.schools_nearby_count IS 'Number of schools within 1km (OpenStreetMap)';
COMMENT ON COLUMN land_listings.hospitals_nearby_count IS 'Number of hospitals within 1km (OpenStreetMap)';
COMMENT ON COLUMN land_listings.markets_nearby_count IS 'Number of markets within 1km (OpenStreetMap)';
COMMENT ON COLUMN land_listings.distance_to_nearest_road_m IS 'Distance to nearest road in meters';
